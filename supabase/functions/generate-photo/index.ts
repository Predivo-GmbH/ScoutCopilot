// Fetch real player photos from TheSportsDB
// Called internally by the search function for players without photos
// POST /generate-photo { player_ids?: number[], apifb_external_ids?: string[] }
// player_ids: numeric IDs for sb_players table
// apifb_external_ids: "apifb-{id}" strings for squad_players table
// Also supports being called directly with service_role key

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logError } from '../_shared/error-log.ts'

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

// ── Image proxy (API-Football CDN → Supabase Storage) ────────────

/**
 * Downloads an image from an external URL (server-side, bypassing hotlink
 * protection) and uploads it to the `player-photos` Supabase Storage bucket.
 * Returns the public Supabase Storage URL, or null on failure.
 */
async function proxyImageToStorage(
  imageUrl: string,
  playerId: string,
  supabaseClient: ReturnType<typeof getServiceClient>,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error(`[Proxy] Failed to download ${imageUrl}: HTTP ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/png";
    const blob = await res.blob();
    if (blob.size === 0) {
      console.error(`[Proxy] Empty response from ${imageUrl}`);
      return null;
    }

    // API-Football returns a ~5 KB generic silhouette for players without real photos.
    // Reject these so the fallback chain (TheSportsDB) can try to find a real photo.
    if (blob.size <= 6000) {
      console.log(`[Proxy] Rejecting placeholder image for ${playerId} (${blob.size} bytes)`);
      return null;
    }

    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg"
      : contentType.includes("webp") ? "webp"
      : "png";
    const storagePath = `${playerId}/photo.${ext}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("player-photos")
      .upload(storagePath, blob, { upsert: true, contentType });

    if (uploadError) {
      console.error(`[Proxy] Upload failed for ${playerId}: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabaseClient.storage
      .from("player-photos")
      .getPublicUrl(storagePath);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log(`[Proxy] Stored ${playerId}: ${publicUrl.slice(0, 80)}…`);
    return publicUrl;
  } catch (err) {
    console.error(`[Proxy] Error for ${playerId}: ${(err as Error).message}`);
    return null;
  }
}

/** Returns true if the URL is from API-Football CDN (known to block hotlinking). */
function isApiFootballCdnUrl(url: string): boolean {
  return url.includes("api-sports.io") || url.includes("media.api-football.com");
}

/** Strip diacritics so search queries stay ASCII-safe. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ── TheSportsDB (primary) ──────────────────────────────────────────

interface SportsDbPlayer {
  strPlayer?: string;
  strThumb?: string;
  strCutout?: string;
  dateBorn?: string;
  strHeight?: string;
  strWeight?: string;
}

interface SportsDbResult {
  photoUrl: string | null;
  dateBorn: string | null;
  strHeight: string | null;
  strWeight: string | null;
}

async function fetchFromSportsDb(playerName: string): Promise<SportsDbResult> {
  const empty: SportsDbResult = { photoUrl: null, dateBorn: null, strHeight: null, strWeight: null };
  const safeName = stripAccents(playerName).slice(0, 100);
  const url = `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(safeName)}`;
  console.log(`[SportsDB] Searching for "${safeName}"…`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[SportsDB] HTTP ${res.status}`);
    return empty;
  }

  const data = await res.json();
  const players: SportsDbPlayer[] = data?.player ?? [];

  if (players.length === 0) {
    console.log(`[SportsDB] No results for "${safeName}"`);
    return empty;
  }

  const match = players[0];
  // TheSportsDB migrated images from www. to r2. CDN — normalize URLs
  const rawPhoto = match.strCutout || match.strThumb || null;
  const photo = rawPhoto?.replace("https://www.thesportsdb.com/images/", "https://r2.thesportsdb.com/images/") ?? null;
  if (photo) {
    console.log(`[SportsDB] Found photo for ${playerName}: ${photo.slice(0, 80)}…`);
  } else {
    console.log(`[SportsDB] Player "${match.strPlayer}" found but no photo`);
  }
  return {
    photoUrl: photo,
    dateBorn: match.dateBorn ?? null,
    strHeight: match.strHeight ?? null,
    strWeight: match.strWeight ?? null,
  };
}

// ── Main handler ───────────────────────────────────────────────────

serve(async (req: Request) => {
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth
    const auth = await getAuthContext(req);

    // Rate limit: 10 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 10 / 60, 10);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const playerIds: number[] = body.player_ids ?? [];
    const apifbExternalIds: string[] = body.apifb_external_ids ?? [];

    if (playerIds.length === 0 && apifbExternalIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing player_ids or apifb_external_ids" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const batch = playerIds.slice(0, 10);

    const supabase = getServiceClient();

    const { data: players, error } = await supabase
      .from("sb_players")
      .select("player_id, player_name, player_nickname, photo_url")
      .in("player_id", batch);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{
      player_id: number | string;
      status: string;
      source?: string;
      photo_url?: string;
      birth_date?: string | null;
      height?: string | null;
      weight?: string | null;
    }> = [];

    // Check if caller wants metadata even for players with photos
    const needsMetadata = body.include_metadata === true;

    // Separate players that need SportsDB lookups from those that can be skipped
    const skipPlayers: typeof players = [];
    const lookupPlayers: typeof players = [];

    for (const p of players ?? []) {
      if (p.photo_url && !needsMetadata) {
        results.push({ player_id: p.player_id, status: "already_has_photo", photo_url: p.photo_url });
        skipPlayers.push(p);
      } else {
        lookupPlayers.push(p);
      }
    }

    // Fetch TheSportsDB data in parallel for all players that need it
    const sportsDbResults = await Promise.allSettled(
      lookupPlayers.map((p) => {
        const displayName = p.player_nickname ?? p.player_name;
        return fetchFromSportsDb(displayName);
      })
    );

    // Process results
    for (let i = 0; i < lookupPlayers.length; i++) {
      const p = lookupPlayers[i];
      const settled = sportsDbResults[i];
      const sportsDbResult = settled.status === "fulfilled"
        ? settled.value
        : { photoUrl: null, dateBorn: null, strHeight: null, strWeight: null };

      if (p.photo_url && needsMetadata) {
        // Persist birth_date even for players that already have photos
        if (sportsDbResult.dateBorn) {
          const parsed = new Date(sportsDbResult.dateBorn);
          if (!isNaN(parsed.getTime())) {
            await supabase
              .from("sb_players")
              .update({ birth_date: sportsDbResult.dateBorn })
              .eq("player_id", p.player_id);
          }
        }
        results.push({
          player_id: p.player_id,
          status: "already_has_photo",
          photo_url: p.photo_url,
          birth_date: sportsDbResult.dateBorn,
          height: sportsDbResult.strHeight,
          weight: sportsDbResult.strWeight,
        });
        continue;
      }

      let photoUrl = sportsDbResult.photoUrl;

      if (photoUrl && !photoUrl.startsWith("https://")) {
        console.warn(`[Validation] Rejecting non-HTTPS photo URL: ${photoUrl.slice(0, 80)}`);
        photoUrl = null;
      }

      // Always persist birth_date when TheSportsDB returns it, regardless of photo
      if (sportsDbResult.dateBorn) {
        const parsed = new Date(sportsDbResult.dateBorn);
        if (!isNaN(parsed.getTime())) {
          await supabase
            .from("sb_players")
            .update({ birth_date: sportsDbResult.dateBorn })
            .eq("player_id", p.player_id);
        }
      }

      if (photoUrl) {
        await supabase
          .from("sb_players")
          .update({ photo_url: photoUrl })
          .eq("player_id", p.player_id);

        const source = photoUrl.includes("thesportsdb.com") ? "sportsdb" : "proxy";
        results.push({
          player_id: p.player_id,
          status: "found",
          source,
          photo_url: photoUrl,
          birth_date: sportsDbResult.dateBorn,
          height: sportsDbResult.strHeight,
          weight: sportsDbResult.strWeight,
        });
      } else {
        results.push({
          player_id: p.player_id,
          status: "not_found",
          birth_date: sportsDbResult.dateBorn,
          height: sportsDbResult.strHeight,
          weight: sportsDbResult.strWeight,
        });
      }
    }

    // ── API-Football players (looked up by external ID in squad_players) ──
    if (apifbExternalIds.length > 0) {
      const apifbBatch = apifbExternalIds.slice(0, 10);
      const { data: squadRows } = await supabase
        .from("squad_players")
        .select("player_external_id, player_name, player_data")
        .in("player_external_id", apifbBatch);

      // Deduplicate: one row per external_id (a player can appear in multiple squads)
      const uniqueByExternalId = new Map<string, typeof squadRows extends (infer T)[] | null ? T : never>();
      for (const row of squadRows ?? []) {
        if (!uniqueByExternalId.has(row.player_external_id)) {
          uniqueByExternalId.set(row.player_external_id, row);
        }
      }

      // Fetch TheSportsDB in parallel for all apifb players
      const apifbEntries = [...uniqueByExternalId.entries()];
      const apifbSportsDbResults = await Promise.allSettled(
        apifbEntries.map(([, row]) => fetchFromSportsDb(row.player_name))
      );

      for (let i = 0; i < apifbEntries.length; i++) {
        const [externalId, row] = apifbEntries[i];
        const pd = (row.player_data ?? {}) as Record<string, unknown>;
        const existingImage = pd.image as string | undefined;

        // If existing image is from API-Football CDN (blocks hotlinking → 403 in browsers),
        // proxy it through Supabase Storage so it actually loads in <img> tags.
        if (existingImage && isApiFootballCdnUrl(existingImage)) {
          console.log(`[Proxy] API-Football CDN URL detected for ${externalId}, proxying…`);
          const proxiedUrl = await proxyImageToStorage(existingImage, externalId, supabase);
          if (proxiedUrl) {
            const updatedPd = { ...pd, image: proxiedUrl };
            await supabase
              .from("squad_players")
              .update({ player_data: updatedPd })
              .eq("player_external_id", externalId);

            results.push({
              player_id: externalId as unknown as number,
              status: "found",
              source: "upload",
              photo_url: proxiedUrl,
            });
            continue;
          }
          // Proxy failed — fall through to TheSportsDB lookup
          console.log(`[Proxy] Failed for ${externalId}, falling back to TheSportsDB…`);
        } else if (existingImage) {
          // Non-API-Football image (Supabase Storage, TheSportsDB) — already works
          results.push({
            player_id: externalId as unknown as number,
            status: "already_has_photo",
            photo_url: existingImage,
          });
          continue;
        }

        const settled = apifbSportsDbResults[i];
        const sportsDbResult = settled.status === "fulfilled"
          ? settled.value
          : { photoUrl: null, dateBorn: null, strHeight: null, strWeight: null };

        let photoUrl = sportsDbResult.photoUrl;

        if (photoUrl && !photoUrl.startsWith("https://")) {
          console.warn(`[Validation] Rejecting non-HTTPS photo URL: ${photoUrl.slice(0, 80)}`);
          photoUrl = null;
        }

        if (photoUrl) {
          // Save generated photo back to squad_players.player_data.image
          const updatedPd = { ...pd, image: photoUrl };
          await supabase
            .from("squad_players")
            .update({ player_data: updatedPd })
            .eq("player_external_id", externalId);

          const source = photoUrl.includes("thesportsdb.com") ? "sportsdb" : "proxy";
          results.push({
            player_id: externalId as unknown as number,
            status: "found",
            source,
            photo_url: photoUrl,
          });
        } else {
          results.push({
            player_id: externalId as unknown as number,
            status: "not_found",
          });
        }
      }

      // Handle external IDs not found in squad_players at all
      for (const extId of apifbBatch) {
        if (!uniqueByExternalId.has(extId)) {
          results.push({
            player_id: extId as unknown as number,
            status: "not_found",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        found: results.filter((r) => r.status === "found").length,
        not_found: results.filter((r) => r.status === "not_found").length,
        skipped: results.filter((r) => r.status === "already_has_photo").length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await logError('generate-photo', 'request', err)
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-photo error:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
