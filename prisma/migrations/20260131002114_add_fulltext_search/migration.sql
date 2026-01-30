CREATE INDEX IF NOT EXISTS idx_product_fulltext
ON "Product" USING GIN (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
);
