#!/bin/bash

echo "🔍 MORTGAGE DROPDOWN ANALYSIS"
echo "================================"
echo ""

# Get all option fields that exist
echo "📋 All option fields that exist:"
curl -s "http://localhost:3001/api/content/mortgage" | jq -r '.data.mortgage_content[] | select(.component_type == "option") | .content_key' | head -10
echo ""

# Check specific fields that should be dropdowns
fields=("bank" "borrowers" "children18" "citizenship" "is_foreigner" "is_medinsurance" "is_public" "partner_pay_mortgage" "tax")

echo "❌ DROPDOWN FIELDS MISSING OPTIONS:"
echo "-----------------------------------"

for field in "${fields[@]}"; do
    echo "🔍 Checking: mortgage_calculation.field.$field"
    
    # Count options for this field
    count=$(curl -s "http://localhost:3001/api/content/mortgage" | jq -r ".data.mortgage_content[] | select(.content_key | contains(\"${field}_option\")) | .content_key" | wc -l | xargs)
    
    if [ "$count" -eq 0 ]; then
        # Get the field title
        title=$(curl -s "http://localhost:3001/api/content/mortgage" | jq -r ".data.mortgage_content[] | select(.content_key == \"mortgage_calculation.field.$field\") | .translations.ru")
        echo "   ❌ MISSING: $field"
        echo "      📝 Title: $title"
        echo ""
    else
        echo "   ✅ HAS OPTIONS: $count"
        echo ""
    fi
done

echo "🏁 Analysis complete!" 