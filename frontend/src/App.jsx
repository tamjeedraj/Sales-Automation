
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeadsDashboard() {
  const availableCities = ["Delhi NCR", "Mumbai", "Jaipur", "Goa"];
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // 🎯 Active selected category ko string state me track karenge
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // axios.get(`http://127.0.0.1:8000/api/leads?city=${encodeURIComponent(selectedCity)}`)
    axios.get(`${import.meta.env.VITE_API_URL}/api/leads`)
      .then(res => {
        if (res.data && res.data.leads) {
          setLeads(res.data.leads);
          setCategories(res.data.categories || []);
          // Jab bhi city badle, default filter "All" par reset ho jaye taaki saara data turant dikhe
          setSelectedCategory("All"); 
        } else {
          setLeads([]);
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Connection Error:", err);
        setLeads([]);
        setLoading(false);
      });
  }, [selectedCity]);

  // 🎯 REAL TIME DYNAMIC FILTER PIPELINE
  const filteredLeads = leads.filter(lead => {
    if (selectedCategory === "All") return true;
    return lead['Category Name'] === selectedCategory;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <div style={{ background: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155' }}>
        
        <h2 style={{ color: '#38bdf8', margin: '0 0 5px 0' }}>🚀 LoversAi - Ultimate Sales Control Panel</h2>
        <p style={{ color: '#94a3b8', margin: '0 0 20px 0' }}></p>
        <hr style={{ border: '0.5px solid #334155', marginBottom: '25px' }} />

        {/* 🎛️ SIDE-BY-SIDE SIDE PANEL ENGINE (HORIZONTAL ROW LOGIC) */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
          
          {/* 🗺️ LEFT BOX: REGION CONTROL PANEL */}
          <div style={{ flex: '1', minWidth: '300px', background: '#0f172a', padding: '18px', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '12px' }}>🗺️ States / Cities Select Box:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '13px',
                    backgroundColor: selectedCity === city ? '#0284c7' : '#334155',
                    color: '#fff',
                    transition: 'all 0.2s',
                    boxShadow: selectedCity === city ? '0 0 10px rgba(2,132,199,0.5)' : 'none'
                  }}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>

          {/* 🏷️ RIGHT BOX: CATEGORY FILTER PANEL (BAGAL ME BOX BANA DIYA HA) */}
          <div style={{ flex: '2', minWidth: '450px', background: '#0f172a', padding: '18px', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '12px' }}>🏷️ Filter by Category Name Box:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              
              {/* Reset Control Tag */}
              <button
                onClick={() => setSelectedCategory("All")}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  backgroundColor: selectedCategory === "All" ? '#ec4899' : '#334155',
                  color: '#fff',
                  transition: 'all 0.2s'
                }}
              >
                ✨ Show All ({leads.length})
              </button>

              {/* Dynamic Excel Category Filters Stream */}
              {categories.map(cat => {
                const count = leads.filter(l => l['Category Name'] === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '13px',
                      backgroundColor: selectedCategory === cat ? '#a855f7' : '#1e293b',
                      color: selectedCategory === cat ? '#fff' : '#cbd5e1',
                      border: selectedCategory === cat ? '1px solid #a855f7' : '1px solid #334155',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* DATA METRICS SUB-HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: '#e2e8f0', margin: 0 }}>🗂️ Database Registry Matrix</h3>
          <span style={{ background: '#0369a1', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
            Active Filter Rows: {filteredLeads.length} Lines
          </span>
        </div>

        {/* 📊 CLEAN 12-COLUMNS DATATABLE */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 'bold', padding: '40px' }}>⚡ Syncing Data Ledger from FastAPI Database Matrix...</p>
        ) : filteredLeads.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: '#0f172a', borderRadius: '8px' }}>⚠️ No records found matching the current grid selection filters.</p>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #334155' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#38bdf8', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Vendor Name</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Contact Number</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>WhatsApp Direct Link</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Category Name</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155', color: '#38bdf8' }}>Vendor Type</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155', color: '#38bdf8' }}>Price Range</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>City Name</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>State Name</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Website Link</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Address</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Rating</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Reviews Count</th>
                  {/* 🎯 STATE NAME KE MATCHING RANG ME INSTAGRAM HEADER */}
                  <th style={{ padding: '12px', borderBottom: '2px solid #334155', color: '#38bdf8' }}>Instagram</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#1e293b' : '#1e293b99', borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{lead['Vendor Name']}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['Contact Number']}</td>
                    <td style={{ padding: '12px' }}>
                      {lead['WhatsApp_Click_Link'] !== '#' ? (
                        <a
                          href={lead['WhatsApp_Click_Link']}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            background: '#16a34a',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          💬 Send WA
                        </a>
                      ) : <span style={{ color: '#64748b' }}>Invalid</span>}
                    </td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{lead['Category Name']}</td>
                    
                    <td style={{ padding: '12px', fontWeight: 'bold', color: lead['Vendor Type'] === 'Five Star' ? '#eab308' : lead['Vendor Type'] === 'Premium' ? '#a855f7' : '#94a3b8' }}>
                      💎 {lead['Vendor Type'] || 'Local'}
                    </td>
                    <td style={{ padding: '12px', color: '#4ade80', fontWeight: 'bold' }}>{lead['Price Range'] || 'On Request'}</td>
                    
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['City Name']}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['State Name']}</td>
                    <td style={{ padding: '12px' }}>
                      {lead['Website'] !== 'Not Available' ? (
                        <a href={lead['Website'].startsWith('http') ? lead['Website'] : `https://${lead['Website']}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                          🌐 Open Site
                        </a>
                      ) : <span style={{ color: '#64748b' }}>None</span>}
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead['Address']}>{lead['Address']}</td>
                    <td style={{ padding: '12px', color: '#eab308', fontWeight: 'bold' }}>⭐ {lead['Rating']}</td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{lead['Reviews Count']}</td>
                    
                    {/* 🎯 FIXED KEY EXTRACTION: Backed response object key 'Instagram Handle' ko yahan explicitly load kiya ha */}
                    <td style={{ padding: '12px' }}>
                      {lead['Instagram Handle'] ? (
                        <a 
                          href={lead['Instagram Handle']} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                          📸 View Profile
                        </a>
                      ) : (
                        <span style={{ color: '#64748b' }}>Not Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function LeadsDashboard() {
//   const availableCities = ["Delhi NCR", "Mumbai", "Jaipur", "Goa"];
//   const [selectedCity, setSelectedCity] = useState("Delhi NCR");
//   const [leads, setLeads] = useState([]);
//   const [categories, setCategories] = useState([]);
  
//   // 🎯 FIX: Active selected category ko string state me track karenge
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     axios.get(`http://127.0.0.1:8000/api/leads?city=${encodeURIComponent(selectedCity)}`)
//       .then(res => {
//         if (res.data && res.data.leads) {
//           setLeads(res.data.leads);
//           setCategories(res.data.categories || []);
//           // Jab bhi city badle, default filter "All" par reset ho jaye taaki saara data turant dikhe
//           setSelectedCategory("All"); 
//         } else {
//           setLeads([]);
//           setCategories([]);
//         }
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Connection Error:", err);
//         setLeads([]);
//         setLoading(false);
//       });
//   }, [selectedCity]);

//   // 🎯 REAL TIME DYNAMIC FILTER PIPELINE
//   const filteredLeads = leads.filter(lead => {
//     if (selectedCategory === "All") return true;
//     return lead['Category Name'] === selectedCategory;
//   });

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
//       <div style={{ background: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155' }}>
        
//         <h2 style={{ color: '#38bdf8', margin: '0 0 5px 0' }}>🚀 LoversAi - Ultimate Sales Control Panel</h2>
//         <p style={{ color: '#94a3b8', margin: '0 0 20px 0' }}>Real-time Verified Streams with Clickable WhatsApp Pointers & Gemini AI Analytics</p>
//         <hr style={{ border: '0.5px solid #334155', marginBottom: '25px' }} />

//         {/* 🎛️ SIDE-BY-SIDE SIDE PANEL ENGINE (HORIZONTAL ROW LOGIC) */}
//         <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
          
//           {/* 🗺️ LEFT BOX: REGION CONTROL PANEL */}
//           <div style={{ flex: '1', minWidth: '300px', background: '#0f172a', padding: '18px', borderRadius: '8px', border: '1px solid #334155' }}>
//             <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '12px' }}>🗺️ States / Cities Select Box:</h4>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//               {availableCities.map(city => (
//                 <button
//                   key={city}
//                   onClick={() => setSelectedCity(city)}
//                   style={{
//                     padding: '10px 18px',
//                     borderRadius: '6px',
//                     border: 'none',
//                     fontWeight: 'bold',
//                     cursor: 'pointer',
//                     fontSize: '13px',
//                     backgroundColor: selectedCity === city ? '#0284c7' : '#334155',
//                     color: '#fff',
//                     transition: 'all 0.2s',
//                     boxShadow: selectedCity === city ? '0 0 10px rgba(2,132,199,0.5)' : 'none'
//                   }}
//                 >
//                   📍 {city}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* 🏷️ RIGHT BOX: CATEGORY FILTER PANEL (BAGAL ME BOX BANA DIYA HA) */}
//           <div style={{ flex: '2', minWidth: '450px', background: '#0f172a', padding: '18px', borderRadius: '8px', border: '1px solid #334155' }}>
//             <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '12px' }}>🏷️ Filter by Category Name Box:</h4>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              
//               {/* Reset Control Tag */}
//               <button
//                 onClick={() => setSelectedCategory("All")}
//                 style={{
//                   padding: '10px 16px',
//                   borderRadius: '6px',
//                   border: 'none',
//                   fontWeight: 'bold',
//                   cursor: 'pointer',
//                   fontSize: '13px',
//                   backgroundColor: selectedCategory === "All" ? '#ec4899' : '#334155',
//                   color: '#fff',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 ✨ Show All ({leads.length})
//               </button>

//               {/* Dynamic Excel Category Filters Stream */}
//               {categories.map(cat => {
//                 const count = leads.filter(l => l['Category Name'] === cat).length;
//                 return (
//                   <button
//                     key={cat}
//                     onClick={() => setSelectedCategory(cat)}
//                     style={{
//                       padding: '10px 16px',
//                       borderRadius: '6px',
//                       border: 'none',
//                       fontWeight: 'bold',
//                       cursor: 'pointer',
//                       fontSize: '13px',
//                       backgroundColor: selectedCategory === cat ? '#a855f7' : '#1e293b',
//                       color: selectedCategory === cat ? '#fff' : '#cbd5e1',
//                       border: selectedCategory === cat ? '1px solid #a855f7' : '1px solid #334155',
//                       transition: 'all 0.2s'
//                     }}
//                   >
//                     {cat} ({count})
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//         </div>

//         {/* DATA METRICS SUB-HEADER */}
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//           <h3 style={{ color: '#e2e8f0', margin: 0 }}>🗂️ Database Registry Matrix</h3>
//           <span style={{ background: '#0369a1', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
//             Active Filter Rows: {filteredLeads.length} Lines
//           </span>
//         </div>

//         {/* 📊 CLEAN 11-COLUMNS DATATABLE */}
//         {loading ? (
//           <p style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 'bold', padding: '40px' }}>⚡ Syncing Data Ledger from FastAPI Database Matrix...</p>
//         ) : filteredLeads.length === 0 ? (
//           <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: '#0f172a', borderRadius: '8px' }}>⚠️ No records found matching the current grid selection filters.</p>
//         ) : (
//           <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #334155' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', whiteSpace: 'nowrap', fontSize: '13px' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#0f172a', color: '#38bdf8', textAlign: 'left' }}>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Vendor Name</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Contact Number</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>WhatsApp Direct Link</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Category Name</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>City Name</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>State Name</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Website Link</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Address</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Rating</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>Reviews Count</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155' }}>WhatsApp Status</th>
//                   <th style={{ padding: '12px', borderBottom: '2px solid #334155', color: '#38bdf8' }}>Instagram</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredLeads.map((lead, idx) => (
//                   <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#1e293b' : '#1e293b99', borderBottom: '1px solid #334155' }}>
//                     <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{lead['Vendor Name']}</td>
//                     <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['Contact Number']}</td>
//                     <td style={{ padding: '12px' }}>
//                       {lead['WhatsApp_Click_Link'] !== '#' ? (
//                         <a
//                           href={lead['WhatsApp_Click_Link']}
//                           target="_blank"
//                           rel="noreferrer"
//                           style={{
//                             display: 'inline-block',
//                             padding: '4px 10px',
//                             borderRadius: '4px',
//                             background: '#16a34a',
//                             color: '#fff',
//                             textDecoration: 'none',
//                             fontWeight: 'bold',
//                             fontSize: '12px'
//                           }}
//                         >
//                           💬 Send WA
//                         </a>
//                       ) : <span style={{ color: '#64748b' }}>Invalid</span>}
//                     </td>
//                     <td style={{ padding: '12px', color: '#cbd5e1' }}>{lead['Category Name']}</td>
//                     <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['City Name']}</td>
//                     <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['State Name']}</td>
//                     <td style={{ padding: '12px' }}>
//                       {lead['Website'] !== 'Not Available' ? (
//                         <a href={lead['Website'].startsWith('http') ? lead['Website'] : `https://${lead['Website']}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
//                           🌐 Open Site
//                         </a>
//                       ) : <span style={{ color: '#64748b' }}>None</span>}
//                     </td>
//                     <td style={{ padding: '12px', color: '#94a3b8', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead['Address']}>{lead['Address']}</td>
//                     <td style={{ padding: '12px', color: '#eab308', fontWeight: 'bold' }}>⭐ {lead['Rating']}</td>
//                     <td style={{ padding: '12px', color: '#cbd5e1' }}>{lead['Reviews Count']}</td>
//                     <td style={{ padding: '12px', color: '#94a3b8' }}>{lead['WhatsApp Status']}</td>
//                     <td style={{ padding: '12px' }}>
//                       <a href={lead['Instagram Handle']} target="_blank" rel="noreferrer" style={{ color: '#f43f5e', textDecoration: 'none', fontWeight: 'bold' }}>
//                         📸 View Profile
//                       </a>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function LeadsDashboard() {
//   const [cities, setCities] = useState([]);
//   const [selectedCity, setSelectedCity] = useState('');
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 1. Fetch Available Cities/Sheets from FastAPI
//   useEffect(() => {
//     axios.get('http://127.0.0.1:8000/api/states-cities')
//       .then(res => {
//         if (res.data && res.data.cities && res.data.cities.length > 0) {
//           setCities(res.data.cities);
//           setSelectedCity(res.data.cities[0]); // Set default to first valid city
//         }
//       })
//       .catch(err => console.error("API Connecting Error:", err));
//   }, []);

//   // 2. Fetch Leads whenever selectedCity changes safely
//   useEffect(() => {
//     if (selectedCity && selectedCity !== 'undefined') {
//       setLoading(true);
      
//       // encodeURIComponent lagane se spaces (like Delhi NCR) URL me sahi se pass hote hain
//       const url = `http://127.0.0.1:8000/api/leads?city=${encodeURIComponent(selectedCity)}`;
      
//       axios.get(url)
//         .then(res => {
//           if (res.data && res.data.leads) {
//             setLeads(res.data.leads);
//           } else {
//             setLeads([]);
//           }
//           setLoading(false);
//         })
//         .catch(err => {
//           console.error("Data Fetching Error:", err);
//           setLeads([]);
//           setLoading(false);
//         });
//     }
//   }, [selectedCity]);

//   return (
//     <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
//       <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>🚀 LoversAi - B2B Sales Intel Engine</h2>
//         <p style={{ color: '#64748b' }}>Dynamic State/City Filters with AI Verified Valid WhatsApp & Instagram Profiles</p>
//         <hr style={{ border: '0.5px solid #e2e8f0' }} />

//         {/* --- FILTER CONTROL PANEL --- */}
//         <div style={{ margin: '20px 0', display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <label style={{ fontWeight: 'bold', color: '#334155' }}>🗺️ Select State / City Tab:</label>
//           <select 
//             value={selectedCity} 
//             onChange={(e) => setSelectedCity(e.target.value)}
//             style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#fff', minWidth: '150px' }}
//           >
//             {cities.length === 0 && <option value="">Loading Cities...</option>}
//             {cities.map(c => <option key={c} value={c}>{c}</option>)}
//           </select>
//           <span style={{ marginLeft: 'auto', background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
//             Total Verified Leads: {leads.length}
//           </span>
//         </div>

//         {/* --- LEADS DATA SYSTEM TABLE --- */}
//         {loading ? (
//           <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold', padding: '4px' }}>⚡ Processing B2B Data Engine via Gemini AI...</p>
//         ) : leads.length === 0 ? (
//           <p style={{ textAlign: 'center', color: '#64748b', padding: '4px' }}>⚠️ No data found. Make sure Python Backend Server is running.</p>
//         ) : (
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: '#fff' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#0f172a', color: '#fff', textAlign: 'left' }}>
//                   <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Vendor Name</th>
//                   <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Contact Number</th>
//                   <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>WhatsApp Status</th>
//                   <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Instagram Targeting</th>
//                   <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Category</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {leads.map((lead, idx) => (
//                   <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
//                     <td style={{ padding: '12px', border: '1px solid #e2e8f0', fontWeight: '500' }}>{lead['Vendor Name'] || lead['vendor_name']}</td>
//                     <td style={{ padding: '12px', border: '1px solid #e2e8f0', color: '#0f172a' }}>{lead['WhatsApp Number'] || lead['WhatsApp_Number'] || lead['Contact Number']}</td>
//                     <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>
//                       <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>
//                         Active WhatsApp
//                       </span>
//                     </td>
//                     <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>
//                       <a href={lead['Instagram Handle'] || lead['instagram_handle']} target="_blank" rel="noreferrer" style={{ color: '#db2777', textDecoration: 'none', fontWeight: 'bold' }}>
//                         📸 View Instagram Profile
//                       </a>
//                     </td>
//                     <td style={{ padding: '12px', border: '1px solid #e2e8f0', color: '#475569' }}>{lead['Category Name'] || lead['category_name']}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }