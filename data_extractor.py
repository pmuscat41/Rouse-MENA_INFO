import pandas as pd
import json
import os

def extract_excel_data(file_path):
    xl = pd.ExcelFile(file_path)
    sheets = xl.sheet_names
    
    # Skip 'Table of content' or non-country sheets if any
    country_sheets = [s for s in sheets if s not in ['Table of content']]
    
    data = {}
    
    for sheet in country_sheets:
        df = pd.read_excel(file_path, sheet_name=sheet)
        
        # Clean up the dataframe (the Excel structure is a bit irregular)
        # We need to find the headers and categories
        
        country_data = {
            "name": sheet,
            "sections": []
        }
        
        current_section = None
        
        for index, row in df.iterrows():
            # Check if it's a section header (usually in column 0 with NaN in others)
            val = str(row.iloc[0]).strip()
            
            if val == 'nan' or val == 'Unnamed: 0':
                continue
                
            # If it's a known top-level category like 'Applications', 'Formal examination', 'Grant', 'Formality documents requirement'
            if val in ['Applications', 'Formal examination', 'Grant', 'Formality documents requirement']:
                current_section = {
                    "title": val,
                    "items": []
                }
                country_data["sections"].append(current_section)
                continue
            
            # If we are in a section, add items
            if current_section:
                # Handle specific table headers inside sections
                if val == 'Formality documents required':
                    continue
                
                # Check for timeline or note
                if 'Timeline for filing formality documents' in val or 'Note:' in val:
                    current_section["items"].append({
                        "type": "note",
                        "content": val
                    })
                    continue

                # Default fee item structure
                item = {
                    "description": val,
                    "prof_fee": str(row.iloc[1]) if len(row) > 1 else "",
                    "comm_fee": str(row.iloc[2]) if len(row) > 2 else "",
                    "indiv_fee": str(row.iloc[3]) if len(row) > 3 else ""
                }
                
                # Clean up 'nan' strings
                for k in item:
                    if item[k] == 'nan': item[k] = ""
                
                current_section["items"].append(item)
            else:
                # Top level info if any (though usually it's just the country name in header)
                pass

        data[sheet] = country_data
        
    return data

if __name__ == "__main__":
    excel_file = "2025 - Middle East and Africa Patent Geographic Hub - Fee Sheet.xlsx"
    output_json = "data.json"
    
    print(f"Extracting data from {excel_file}...")
    extracted_data = extract_excel_data(excel_file)
    
    with open(output_json, 'w') as f:
        json.dump(extracted_data, f, indent=4)
    
    print(f"Extracted data for {len(extracted_data)} countries to {output_json}")
