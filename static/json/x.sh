#!/bin/bash

# Input JSON file containing the GeoFeatureCollection
INPUT_FILE="$1"
OUTPUT_FILE="country_bounding_boxes.json"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed. Please install jq and try again."
    exit 1
fi

# Check if input file is provided
if [ -z "$INPUT_FILE" ]; then
    echo "Usage: $0 <input_file.json>"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "File not found: $INPUT_FILE"
    exit 1
fi

# Initialize output JSON array
echo '[' > "$OUTPUT_FILE"

# Loop through each feature in the GeoFeatureCollection
jq -c '.features[]' "$INPUT_FILE" | while read -r feature; do
    # Extract the ISO_A2 property for identification
    ISO_A2=$(echo "$feature" | jq -r '.properties.ISO_A2')
    
    # Skip if ISO_A2 is null or empty
    if [ -z "$ISO_A2" ] || [ "$ISO_A2" == "null" ]; then
        echo "Skipping feature with missing ISO_A2"
        continue
    fi
    
    # Extract all coordinates for MultiPolygon and flatten them
    # MultiPolygon format: [[[lon, lat], [lon, lat], ...], ...]
    lons=$(echo "$feature" | jq '[.geometry.coordinates[][][] | .[0]]')
    lats=$(echo "$feature" | jq '[.geometry.coordinates[][][] | .[1]]')
    
    # Compute the min/max longitude and latitude
    min_lon=$(echo "$lons" | jq 'min')
    max_lon=$(echo "$lons" | jq 'max')
    min_lat=$(echo "$lats" | jq 'min')
    max_lat=$(echo "$lats" | jq 'max')

    # Format bounding box as JSON
    bbox_json=$(jq -n --arg iso_a2 "$ISO_A2" \
                   --argjson min_lon "$min_lon" \
                   --argjson min_lat "$min_lat" \
                   --argjson max_lon "$max_lon" \
                   --argjson max_lat "$max_lat" \
                   '{ISO_A2: $iso_a2, bounding_box: {min_lon: $min_lon, min_lat: $min_lat, max_lon: $max_lon, max_lat: $max_lat}}')

    # Append to output file
    echo "$bbox_json," >> "$OUTPUT_FILE"
done

# Close JSON array
# Remove the trailing comma from the last element and finalize the JSON array
sed -i '$ s/,$//' "$OUTPUT_FILE"
echo ']' >> "$OUTPUT_FILE"

echo "Bounding boxes written to $OUTPUT_FILE"
