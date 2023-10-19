import { func } from 'prop-types';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

class Advice {
  constructor(id, specieName, operationAdvice, quantity, price) {
    this.id = id;
    this.specieName = specieName;
    this.operationAdvice = operationAdvice;
    this.quantity = quantity;
    this.price = price;
  }
}

function FCIRegulationPosition() {
  const [excelData, setExcelData] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [responseData, setResponseData] = useState([{ id: '', specieType: '', operationAdvices: [Advice] }]);
  // const [responseData, setResponseData] = useState([]);
  // const [data, setData] = useState([{ id: '', symbol: '', name: '', description: '', composition: [FCIComposition], compositionWithId: [FCIComposition] }]);

  

  // class Specie {
  //   constructor(specieType, operationAdvices) {
  //     this.specieType = specieType;
  //     this.operationAdvices = operationAdvices;
  //   }
  // }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  const processExcel = () => {
    if (!excelFile) {
      return;
    }

  const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      setExcelData(excelData);
    };
    reader.readAsBinaryString(excelFile);
  };

  const convertToJSON = () => {
    const jsonData = excelData.map((row) => ({
      // Customize this based on your Excel structure
      property1: row['Column1'],
      property2: row['Column2'],
      // Add more properties as needed
    }));
    setJsonData(jsonData);
  };

  const sendDataToBackend = () => {
    fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: "{\"position\":" + JSON.stringify(excelData, null, 1) + "}",
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the backend if needed
        console.log('Backend response:', data);
        setResponseData(data);
        console.log("responseData = " + JSON.stringify(responseData));
        // console.log("Parsed responseData = " + JSON.parse(responseData));
        // setResponseText(JSON.stringify(data, null, 2))
        // var new Advice(data.operationAdvices.specieName, 
        //            data.operationAdvices.operationAdvice, 
        //            data.operationAdvices.quantity, 
        //            data.operationAdvices.price)
        // data.specieType
        // new Specie(data.specie)
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  // useEffect(() => {
  //  sendDataToBackend();
  // }, []);

  const applicants = [ {
    name: 'Joe', work: 'freelance-developer',
    blogs: '54', websites: '32',
    hackathons: '6', location: 'morocco', id: '0',
  },
  {
    name: 'janet', work: 'fullstack-developer', 
    blogs: '34', websites: '12', 
    hackathons: '8', location: 'Mozambique', id: '1',
  },

];

function aplicant() {
  return (
    <>
    {applicants.map(function(data) {
      return (
        <div key={data.name}>
          Applicant name:  {data.name}
        </div>
      )
    })}
    </>

  )
}

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={processExcel}>Process Excel</button>
      <button onClick={convertToJSON}>Convert to JSON</button>
      <button onClick={sendDataToBackend}>Send Data to Backend</button>
      <div>
        <h2>Excel Data</h2>
        <pre>{JSON.stringify(excelData, null, 2)}</pre>
      </div>
      <div>
        <h2>JSON Data</h2>
        <pre>{JSON.stringify(jsonData, null, 2)}</pre>
      </div>
      <div>    
                    <h2>Converted to JSON format Excel Data</h2>
                    <pre>{JSON.stringify(excelData, null, 2)}</pre>
                </div>
                <h2>Response Data</h2>
                {console.log("is responseData.length greater than 0? = " + responseData.length)}
                <div>
                  {aplicant()}
                < >
                  {responseData.map((item) => 
                    <React.Fragment key={item.id}>
                      <h1>{item.specieType}</h1>
                      {item.operationAdvices.map((advice) => 
                            <React.Fragment key={advice.id}>
                              <h2>{advice.specieName}</h2> 
                              <h2>{advice.operationAdvice}</h2> 
                              <h2>{advice.quantity}</h2> 
                              <h2>{advice.price}</h2> 
                            </React.Fragment> )}
                     
                    </React.Fragment>
                    
                  )}
                </> 
                </div>
      
           
                  
    </div>
  );
}

export default FCIRegulationPosition;