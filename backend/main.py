
import os
import re
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import pandas as pd

load_dotenv()

app = FastAPI(title="LoversAi Production Sync Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# 🎯 USING THE NEW EXTENDED EXCEL SHEETS MATRIX
EXCEL_FILE = "Master_North_India_B2B_Automation_System_Filtered_New.xlsx"

CITY_MAPPING = {
    "delhi": "Delhi NCR",
    "delhi ncr": "Delhi NCR",
    "mumbai": "Mumbai",
    "jaipur": "Jaipur",
    "goa": "Goa"
}

def get_instagram_via_gemini(vendor_name, city):
    """
    🎯 REAL ID BYPASS LOGIC FIXED:
    Instagram login-wall issue se bachne ke liye direct Google Search framework use karenge,
    jo instant official Real Instagram Account open karega bina 'Profile broken' error ke.
    """
    clean_vendor = str(vendor_name).strip().replace(' ', '+')
    clean_city = str(city).strip().replace(' ', '+')
    google_search_route = f"https://www.google.com/search?q={clean_vendor}+{clean_city}+instagram+official+profile"
    
    if not os.getenv("GEMINI_API_KEY"):
        return google_search_route
        
    prompt = (
        f"Find the official Instagram profile URL for the wedding vendor named '{vendor_name}' "
        f"located in '{city}', India. Return ONLY the absolute URL and nothing else. If not sure, return 'NONE'."
    )
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        url = response.text.strip().replace("`", "").replace("html", "").strip()
        # Agar response me genuine clear link ha bina search filters ke, toh use return karein
        if "instagram.com" in url and "search" not in url:
            return url
        return google_search_route
    except:
        return google_search_route

@app.get("/api/states-cities")
def get_states_cities():
    target_file = EXCEL_FILE
    if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
        target_file = f"../{EXCEL_FILE}"
    if not os.path.exists(target_file):
        return {"cities": ["Delhi NCR", "Mumbai", "Jaipur", "Goa"]}
    xls = pd.ExcelFile(target_file, engine="openpyxl")
    return {"cities": xls.sheet_names}

@app.get("/api/leads")
def get_leads(city: str = Query(...), category: str = Query(None)):
    target_file = EXCEL_FILE
    if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
        target_file = f"../{EXCEL_FILE}"
        
    if not os.path.exists(target_file):
        return {"error": "Excel database file not found.", "categories": [], "leads": []}
    
    mapped_sheet = CITY_MAPPING.get(city.lower(), city)
    
    try:
        df = pd.read_excel(target_file, sheet_name=mapped_sheet, engine="openpyxl")
    except Exception as e:
        return {"error": f"Sheet reference error: {str(e)}", "categories": [], "leads": []}
    
    if 'WhatsApp Number' not in df.columns and 'Contact Number' in df.columns:
        df['WhatsApp Number'] = df['Contact Number']
    
    def clean_whatsapp(val):
        if pd.isna(val) or str(val).lower() == 'not available':
            return None
        num_str = re.sub(r'\D', '', str(val))
        if len(num_str) == 12 and num_str.startswith('91'):
            return num_str[-10:]
        elif len(num_str) >= 10:
            return num_str[-10:]
        return None

    df['Clean_WA_Number'] = df['WhatsApp Number'].apply(clean_whatsapp)
    df['WhatsApp_Click_Link'] = df['Clean_WA_Number'].apply(
        lambda x: f"https://wa.me/91{x}" if x else "#"
    )

    # 🚀 REAL INSTAGRAM LINK REPAIR PIPELINE
    if 'Instagram Handle' not in df.columns:
        df['Instagram Handle'] = df.apply(lambda row: get_instagram_via_gemini(row['Vendor Name'], mapped_sheet), axis=1)
    else:
        # Check if row data already has google bypass route or direct valid path
        df['Instagram Handle'] = df.apply(
            lambda row: row['Instagram Handle'] if ("instagram.com" in str(row['Instagram Handle']) and "search" not in str(row['Instagram Handle'])) or "google.com" in str(row['Instagram Handle'])
            else get_instagram_via_gemini(row['Vendor Name'], mapped_sheet), axis=1
        )

    # Clean strings values taaki javascript object crash na ho
    df['Rating'] = df['Rating'].fillna("0.0")
    df['Reviews Count'] = df['Reviews Count'].fillna("0")
    df['Website'] = df['Website'].fillna("Not Available")
    df['Address'] = df['Address'].fillna("Not Available")
    
    # 🎯 FORCE READ NEW KEY COLUMNS FOR FRONTEND OBJECT PARSING
    df['Vendor Type'] = df['Vendor Type'].fillna("Local").astype(str).str.strip()
    df['Price Range'] = df['Price Range'].fillna("On Request").astype(str).str.strip()
    
    # Drop unnecessary columns safely
    if 'WhatsApp Status' in df.columns:
        df = df.drop(columns=['WhatsApp Status'])
    if 'Matched with HR Sheet' in df.columns:
        df = df.drop(columns=['Matched with HR Sheet'])

    df['Category Name'] = df['Category Name'].astype(str).str.strip()
    categories_list = [cat for cat in df['Category Name'].unique().tolist() if cat.lower() != 'nan' and cat != '']

    if category:
        df = df[df['Category Name'].str.lower() == category.lower()]
        
    # JSON safe parsing configuration
    df = df.fillna("Not Available")
    leads_list = df.to_dict(orient="records")

    return {
        "city": mapped_sheet,
        "total_count": len(df),
        "categories": categories_list,
        "leads": leads_list
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# import os
# import re
# from fastapi import FastAPI, Query
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import google.generativeai as genai
# import pandas as pd

# load_dotenv()

# app = FastAPI(title="LoversAi Production Sync Engine")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if GEMINI_API_KEY:
#     genai.configure(api_key=GEMINI_API_KEY)

# # 🎯 USING THE NEW EXTENDED EXCEL SHEETS MATRIX
# EXCEL_FILE = "Master_North_India_B2B_Automation_System_Filtered_New.xlsx"

# CITY_MAPPING = {
#     "delhi": "Delhi NCR",
#     "delhi ncr": "Delhi NCR",
#     "mumbai": "Mumbai",
#     "jaipur": "Jaipur",
#     "goa": "Goa"
# }

# def get_instagram_via_gemini(vendor_name, city):
#     if not os.getenv("GEMINI_API_KEY"):
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"
#     prompt = (
#         f"Find the official Instagram profile URL for the wedding vendor named '{vendor_name}' "
#         f"located in '{city}', India. Return ONLY the absolute URL and nothing else."
#     )
#     try:
#         model = genai.GenerativeModel('gemini-2.5-flash')
#         response = model.generate_content(prompt)
#         url = response.text.strip().replace("`", "").replace("html", "").strip()
#         if "instagram.com" in url:
#             return url
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"
#     except:
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"

# @app.get("/api/states-cities")
# def get_states_cities():
#     target_file = EXCEL_FILE
#     if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
#         target_file = f"../{EXCEL_FILE}"
#     if not os.path.exists(target_file):
#         return {"cities": ["Delhi NCR", "Mumbai", "Jaipur", "Goa"]}
#     xls = pd.ExcelFile(target_file, engine="openpyxl")
#     return {"cities": xls.sheet_names}

# @app.get("/api/leads")
# def get_leads(city: str = Query(...), category: str = Query(None)):
#     target_file = EXCEL_FILE
#     if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
#         target_file = f"../{EXCEL_FILE}"
        
#     if not os.path.exists(target_file):
#         return {"error": "Excel database file not found.", "categories": [], "leads": []}
    
#     mapped_sheet = CITY_MAPPING.get(city.lower(), city)
    
#     try:
#         df = pd.read_excel(target_file, sheet_name=mapped_sheet, engine="openpyxl")
#     except Exception as e:
#         return {"error": f"Sheet reference error: {str(e)}", "categories": [], "leads": []}
    
#     if 'WhatsApp Number' not in df.columns and 'Contact Number' in df.columns:
#         df['WhatsApp Number'] = df['Contact Number']
    
#     def clean_whatsapp(val):
#         if pd.isna(val) or str(val).lower() == 'not available':
#             return None
#         num_str = re.sub(r'\D', '', str(val))
#         if len(num_str) == 12 and num_str.startswith('91'):
#             return num_str[-10:]
#         elif len(num_str) >= 10:
#             return num_str[-10:]
#         return None

#     df['Clean_WA_Number'] = df['WhatsApp Number'].apply(clean_whatsapp)
#     df['WhatsApp_Click_Link'] = df['Clean_WA_Number'].apply(
#         lambda x: f"https://wa.me/91{x}" if x else "#"
#     )

#     # 🚀 REAL INSTAGRAM LINK REPAIR: Agar database me handle missing ha ya clear nhi ha to generation default pipeline pass hoga
#     if 'Instagram Handle' not in df.columns:
#         df['Instagram Handle'] = df.apply(lambda row: get_instagram_via_gemini(row['Vendor Name'], mapped_sheet), axis=1)
#     else:
#         df['Instagram Handle'] = df['Instagram Handle'].fillna("").apply(
#             lambda x: x if "instagram.com" in str(x) else f"https://instagram.com/search?q=wedding+vendors"
#         )

#     # Clean strings values taaki javascript object crash na ho
#     df['Rating'] = df['Rating'].fillna("0.0")
#     df['Reviews Count'] = df['Reviews Count'].fillna("0")
#     df['Website'] = df['Website'].fillna("Not Available")
#     df['Address'] = df['Address'].fillna("Not Available")
    
#     # 🎯 FORCE READ NEW KEY COLUMNS FOR FRONTEND OBJECT PARSING
#     df['Vendor Type'] = df['Vendor Type'].fillna("Local").astype(str).str.strip()
#     df['Price Range'] = df['Price Range'].fillna("On Request").astype(str).str.strip()
    
#     # Drop unnecessary columns safely
#     if 'WhatsApp Status' in df.columns:
#         df = df.drop(columns=['WhatsApp Status'])
#     if 'Matched with HR Sheet' in df.columns:
#         df = df.drop(columns=['Matched with HR Sheet'])

#     df['Category Name'] = df['Category Name'].astype(str).str.strip()
#     categories_list = [cat for cat in df['Category Name'].unique().tolist() if cat.lower() != 'nan' and cat != '']

#     if category:
#         df = df[df['Category Name'].str.lower() == category.lower()]
        
#     # JSON safe parsing configuration
#     df = df.fillna("Not Available")
#     leads_list = df.to_dict(orient="records")

#     return {
#         "city": mapped_sheet,
#         "total_count": len(df),
#         "categories": categories_list,
#         "leads": leads_list
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# import os
# import re
# from fastapi import FastAPI, Query
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import google.generativeai as genai
# import pandas as pd

# load_dotenv()

# app = FastAPI(title="LoversAi WhatsApp Link Fixed Engine")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if GEMINI_API_KEY:
#     genai.configure(api_key=GEMINI_API_KEY)

# EXCEL_FILE = "Master_North_India_B2B_Automation_System_Filtered.xlsx"

# CITY_MAPPING = {
#     "delhi": "Delhi NCR",
#     "delhi ncr": "Delhi NCR",
#     "mumbai": "Mumbai",
#     "jaipur": "Jaipur",
#     "goa": "Goa"
# }

# def get_instagram_via_gemini(vendor_name, city):
#     if not os.getenv("GEMINI_API_KEY"):
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"
#     prompt = (
#         f"Find the official Instagram profile URL for the wedding vendor named '{vendor_name}' "
#         f"located in '{city}', India. Return ONLY the absolute URL and nothing else."
#     )
#     try:
#         model = genai.GenerativeModel('gemini-2.5-flash')
#         response = model.generate_content(prompt)
#         url = response.text.strip().replace("`", "").replace("html", "").strip()
#         if "instagram.com" in url:
#             return url
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"
#     except:
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"

# @app.get("/api/states-cities")
# def get_states_cities():
#     target_file = EXCEL_FILE
#     if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
#         target_file = f"../{EXCEL_FILE}"
#     if not os.path.exists(target_file):
#         return {"error": "Excel missing"}
#     xls = pd.ExcelFile(target_file, engine="openpyxl")
#     return {"cities": xls.sheet_names}

# @app.get("/api/leads")
# def get_leads(city: str = Query(...), category: str = Query(None)):
#     target_file = EXCEL_FILE
#     if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
#         target_file = f"../{EXCEL_FILE}"
        
#     if not os.path.exists(target_file):
#         return {"error": "Excel database file not found."}
    
#     mapped_sheet = CITY_MAPPING.get(city.lower(), city)
    
#     try:
#         df = pd.read_excel(target_file, sheet_name=mapped_sheet, engine="openpyxl")
#     except Exception as e:
#         return {"error": f"Sheet reference error: {str(e)}"}
    
#     if 'WhatsApp Number' not in df.columns and 'Contact Number' in df.columns:
#         df['WhatsApp Number'] = df['Contact Number']
    
#     # 🎯 SOLID EXTRACTOR: +91, spaces, bracket sab clean karke sirf 10 digit nikalega
#     def clean_whatsapp(val):
#         if pd.isna(val) or str(val).lower() == 'not available':
#             return None
#         num_str = re.sub(r'\D', '', str(val))
#         if len(num_str) == 12 and num_str.startswith('91'):
#             return num_str[-10:]
#         elif len(num_str) >= 10:
#             return num_str[-10:]
#         return None

#     df['Clean_WA_Number'] = df['WhatsApp Number'].apply(clean_whatsapp)
    
#     # 🚀 EXACT WA DIRECT ROUTE LINK
#     df['WhatsApp_Click_Link'] = df['Clean_WA_Number'].apply(
#         lambda x: f"https://wa.me/91{x}" if x else "#"
#     )

#     if 'Instagram Handle' not in df.columns:
#         df['Instagram Handle'] = df.apply(lambda row: get_instagram_via_gemini(row['Vendor Name'], mapped_sheet), axis=1)

#     df['Rating'] = df['Rating'].fillna("0.0")
#     df['Reviews Count'] = df['Reviews Count'].fillna("0")
#     df['Website'] = df['Website'].fillna("Not Available")
#     df['Address'] = df['Address'].fillna("Not Available")
#     df['WhatsApp Status'] = df['WhatsApp Status'].fillna("Unknown")
    
#     if 'Matched with HR Sheet' in df.columns:
#         df = df.drop(columns=['Matched with HR Sheet'])

#     df['Category Name'] = df['Category Name'].astype(str).str.strip()
#     categories_list = [cat for cat in df['Category Name'].unique().tolist() if cat.lower() != 'nan' and cat != '']

#     if category:
#         df = df[df['Category Name'].str.lower() == category.lower()]
        
#     df = df.fillna("Not Available")

#     return {
#         "city": mapped_sheet,
#         "total_count": len(df),
#         "categories": categories_list,
#         "leads": df.to_dict(orient="records")
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# import os
# import re
# from fastapi import FastAPI, Query
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import google.generativeai as genai
# import pandas as pd

# load_dotenv()

# app = FastAPI(title="LoversAi B2B Master Engine")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if GEMINI_API_KEY:
#     genai.configure(api_key=GEMINI_API_KEY)

# EXCEL_FILE = "Master_North_India_B2B_Automation_System_Filtered.xlsx"

# CITY_MAPPING = {
#     "delhi": "Delhi NCR",
#     "delhi ncr": "Delhi NCR",
#     "mumbai": "Mumbai",
#     "jaipur": "Jaipur",
#     "goa": "Goa"
# }

# def get_instagram_via_gemini(vendor_name, city):
#     if not os.getenv("GEMINI_API_KEY"):
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"
#     prompt = (
#         f"Find the official Instagram profile URL for the wedding vendor named '{vendor_name}' "
#         f"located in '{city}', India. Return ONLY the absolute URL and nothing else."
#     )
#     try:
#         model = genai.GenerativeModel('gemini-2.5-flash')
#         response = model.generate_content(prompt)
#         url = response.text.strip().replace("`", "").replace("html", "").strip()
#         if "instagram.com" in url:
#             return url
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"
#     except:
#         return f"https://instagram.com/search?q={str(vendor_name).replace(' ', '+')}"

# @app.get("/api/states-cities")
# def get_states_cities():
#     target_file = EXCEL_FILE
#     if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
#         target_file = f"../{EXCEL_FILE}"
#     if not os.path.exists(target_file):
#         return {"error": "Excel missing"}
#     xls = pd.ExcelFile(target_file, engine="openpyxl")
#     return {"cities": xls.sheet_names}

# @app.get("/api/leads")
# def get_leads(city: str = Query(...), category: str = Query(None)):
#     target_file = EXCEL_FILE
#     if not os.path.exists(target_file) and os.path.exists(f"../{EXCEL_FILE}"):
#         target_file = f"../{EXCEL_FILE}"
        
#     if not os.path.exists(target_file):
#         return {"error": "Excel database file not found."}
    
#     mapped_sheet = CITY_MAPPING.get(city.lower(), city)
    
#     try:
#         df = pd.read_excel(target_file, sheet_name=mapped_sheet, engine="openpyxl")
#     except Exception as e:
#         return {"error": f"Sheet reference error: {str(e)}"}
    
#     if 'WhatsApp Number' not in df.columns and 'Contact Number' in df.columns:
#         df['WhatsApp Number'] = df['Contact Number']
    
#     def clean_whatsapp(val):
#         num_str = re.sub(r'\D', '', str(val))
#         if len(num_str) >= 10 and 'not' not in str(val).lower():
#             return num_str[-10:]
#         return None

#     df['Clean_WA_Number'] = df['WhatsApp Number'].apply(clean_whatsapp)
#     df['WhatsApp_Click_Link'] = df['Clean_WA_Number'].apply(
#         lambda x: f"https://wa.me/91{x}" if x else "#"
#     )

#     if 'Instagram Handle' not in df.columns:
#         df['Instagram Handle'] = df.apply(lambda row: get_instagram_via_gemini(row['Vendor Name'], mapped_sheet), axis=1)

#     df['Rating'] = df['Rating'].fillna("0.0")
#     df['Reviews Count'] = df['Reviews Count'].fillna("0")
#     df['Website'] = df['Website'].fillna("Not Available")
#     df['Address'] = df['Address'].fillna("Not Available")
#     df['WhatsApp Status'] = df['WhatsApp Status'].fillna("Unknown")
    
#     if 'Matched with HR Sheet' in df.columns:
#         df = df.drop(columns=['Matched with HR Sheet'])

#     # 🎯 FORCE STRING CONVERSION: Category Name ko strictly text bana rahe hain taaki missing blanks na rahein
#     df['Category Name'] = df['Category Name'].astype(str).str.strip()
    
#     # "nan" ya empty values ko drop karke list banayein
#     categories_list = [cat for cat in df['Category Name'].unique().tolist() if cat.lower() != 'nan' and cat != '']

#     if category:
#         df = df[df['Category Name'].str.lower() == category.lower()]
        
#     df = df.fillna("Not Available")

#     return {
#         "city": mapped_sheet,
#         "total_count": len(df),
#         "categories": categories_list,
#         "leads": df.to_dict(orient="records")
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)





# from fastapi import FastAPI, Query
# from fastapi.middleware.cors import CORSMiddleware
# import pandas as pd
# import os
# import re

# app = FastAPI(title="LoversAi B2B Lead Automation API")

# # Allow Frontend (React) to connect without CORS errors
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# EXCEL_FILE = "../Master_North_India_B2B_Automation_System_Filtered.xlsx"

# def get_clean_instagram(vendor_name):
#     """
#     AI Logic Sandbox: Ideal place to hook OpenAI/Gemini API.
#     For now, generating valid string handles dynamically.
#     """
#     clean_name = re.sub(r'[^a-zA-Z0-dict]', '', str(vendor_name)).lower()
#     return f"https://instagram.com/{clean_name[:15]}"

# @app.get("/api/states-cities")
# def get_states_cities():
#     if not os.path.exists(EXCEL_FILE):
#         return {"error": "Excel file missing"}
#     xls = pd.ExcelFile(EXCEL_FILE, engine="openpyxl")
#     return {"cities": xls.sheet_names}

# @app.get("/api/leads")
# def get_filtered_leads(city: str = Query(...), category: str = Query(None)):
#     if not os.path.exists(EXCEL_FILE):
#         return {"error": "Excel file missing"}
    
#     df = pd.read_excel(EXCEL_FILE, sheet_name=city, engine="openpyxl")
    
#     # Check if Instagram exists, else inject dynamically
#     if 'Instagram Handle' not in df.columns:
#         df['Instagram Handle'] = df['Vendor Name'].apply(get_clean_instagram)
        
#     if 'WhatsApp Number' not in df.columns and 'Contact Number' in df.columns:
#         df['WhatsApp Number'] = df['Contact Number']

#     # Filter by category if requested
#     if category:
#         df = df[df['Category Name'].str.lower() == category.lower()]
        
#     # Replace NaN for clean JSON response
#     df = df.fillna("Not Available")
    
#     return {
#         "total_count": len(df),
#         "leads": df.to_dict(orient="records")
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main.py", host="127.0.0.1", port=8000, reload=True)