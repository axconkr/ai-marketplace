#!/bin/bash

# Fix toast variant: 'destructive' → 'error'

files=(
  "app/(marketplace)/dashboard/products/page.tsx"
  "app/(marketplace)/dashboard/reviews/page.tsx"
  "app/(marketplace)/profile/password/page.tsx"
  "app/(marketplace)/products/[id]/page.tsx"
  "components/reviews/ReviewCard.tsx"
  "components/reviews/ReviewForm.tsx"
  "components/products/product-card.tsx"
  "components/products/product-form.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    sed -i.bak "s/variant: 'destructive'/variant: 'error'/g" "$file"
    echo "✓ Fixed: $file"
  fi
done

echo "Done!"
