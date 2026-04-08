-- Allow users to delete their own search queries
-- search_results rows cascade-delete automatically (FK constraint)
create policy "Users can delete own searches"
  on search_queries for delete
  using (user_id = auth.uid());
