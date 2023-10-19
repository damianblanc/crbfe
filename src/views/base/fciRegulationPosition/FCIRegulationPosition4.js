import React from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow} from '@coreui/react'


function FCIRegulationPosition () {

    const readExcelFile = (e) => {
        e.preventDefault();
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                console.log(json);
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    }      

    const downloadExcel = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
        XLSX.writeFile(workbook, "DataSheet.xlsx");
      };

    return (
        <CRow>
        <CCol xs={12}>
        <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">Upload FCI Position</strong>
              </CCardHeader>
              <CCardBody>
        {/* <h2>Upload Position File </h2> */}
        <input
            type="file"
            name="upload"
            id="upload"
            onChange={readExcelFile}
        />
        </CCardBody>  
        </CCard>      
    
        <CCard>
            <CCardHeader>
                <strong className="text-medium-emphasis small">Download Excel</strong>
            </CCardHeader>
            <CCardBody>
                        
                    <button onClick={()=>this.downloadExcel(
                        "{\"fciRegulationDTO\":{\"id\":null,\"name\":\"Alpha Mix Rent FCI\",\"symbol\":\"AMR23\",\"composition\":[{\"id\":null,\"specieType\":\"Equity\",\"percentage\":30.0},{\"id\":null,\"specieType\":\"Bond\",\"percentage\":50.0},{\"id\":null,\"specieType\":\"Cash\",\"percentage\":20.0}],\"fciregulationComposition\":{\"MARKET_SHARE\":30.0,\"BOND\":50.0,\"CASH\":20.0},\"compositionAsSpecieType\":{\"Bond\":50.0,\"Cash\":20.0,\"Equity\":30.0}},\"fciPositionList\":[{\"name\":\"BANCO GALICIA\",\"symbol\":\"GGAL\",\"specieType\":\"Equity\",\"price\":3.15,\"quantity\":1500},{\"name\":\"YPF ESTATAL\",\"symbol\":\"YPFD\",\"specieType\":\"Equity\",\"price\":8.5,\"quantity\":6000},{\"name\":\"GLOBAL BOND GD41\",\"symbol\":\"GD41\",\"specieType\":\"Bond\",\"price\":0.6,\"quantity\":40000},{\"name\":\"LOCAL BOND T3X4\",\"symbol\":\"T3X4\",\"specieType\":\"Bond\",\"price\":1.4,\"quantity\":30000},{\"name\":\"CASH\",\"symbol\":\"CASH\",\"specieType\":\"Cash\",\"price\":25000.0,\"quantity\":1}]}"
                    )}>
                            Download As Excel
                    </button>
                
            </CCardBody>  
        </CCard>      
        </CCol>
        </CRow>
    )
}

export default FCIRegulationPosition;