import { Client } from "basic-ftp";
const client = new Client();
client.ftp.verbose = false;
try {
  await client.access({ host: "scoutcopilot.com", user: "scoutcopilot.com_0pmnrney1xq", password: "9t8$8JTeHp", secure: false });
  await client.cd("/httpdocs");
  await client.clearWorkingDir();
  await client.uploadFromDir("./dist");
  console.log("ScoutCopilot deployed successfully to scoutcopilot.com");
} catch(e) { console.error("Deploy failed:", e.message); } finally { client.close(); }
