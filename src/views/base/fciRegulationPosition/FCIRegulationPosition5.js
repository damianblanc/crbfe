import React, { Component, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow} from '@coreui/react'

async function SendDataToBackend( state ) {
    console.log("position param = " + state.position);
    const requestData = JSON.stringify(state, null, 1);
    const response = await fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestData,
      })
    const data = await response.json(); 
    console.log("data.Bond = " + data.Bond);
    console.log("data.jsonData = " + data.jsonData); 

    return data;

    // return (
    //     <CCard>
    //     <CCardHeader>
    //         <strong>Outcome FCI Position Advice</strong>
    //     </CCardHeader>
    //     <CCardBody>
    //         <table>
    //             <thead>
    //             <tr>
    //                 <th>#</th>
    //                 <th>Specie</th>
    //                 <th>Advice</th>
    //                 <th>Quantity</th>
    //                 <th>Price</th>
    //             </tr>
    //             </thead>
    //             <tbody>
    //             {data.Bond.map((row) => {
    //                 <React.Fragment key={row.id}>
    //                 return (
    //                     {console.log("row.specieName = " + row.specieName)}
    //                     <tr>
    //                         <td>{row.specieName}</td>
    //                         <td>{row.operationAdvice}</td>
    //                         <td>{row.quantity}</td>
    //                         <td>{row.price}</td>
    //                     </tr>    
    //                 )
    //                 </React.Fragment>
    //             }
    //             )}
    //             </tbody>
    //         </table> 
    //     </CCardBody>
    //     </CCard>
    // )
}

// function SendDataToBackend(state) {
    // const [data, setData] = useState({ specie: '', advice: '', quantity: '', price: ''});
//     const jsonData = JSON.stringify(state, null, 1);
//     fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: jsonData,
//     })
//       .then((response) => response.json())
//       .then((json) => setData(json))
//       .then((json) => {
//         console.log('Data sent to the backend:', jsonData);
//         console.log(json);
//       })
//       .catch((error) => {
//         console.error('Error sending data to the backend:', error);
//       });
    
//     return (
//         <CCard>
//         <CCardHeader>
//           <strong>Outcome FCI Position Advice</strong>
//         </CCardHeader>
//         <CCardBody>
//           <table>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Specie</th>
//                   <th>Advice</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//               {data.map((row) => {
//                 <React.Fragment key={row.id}>
//                 <tr>
//                   <td>{row.specieName}</td>
//                   <td>{row.operationAdvice}</td>
//                   <td>{row.quantity}</td>
//                   <td>{row.price}</td>
//                 </tr>    
//                 </React.Fragment>
//               })}
//               </tbody>
//           </table> 
//       </CCardBody>
//       </CCard>
//     )  
// }

class fciRegulationPosition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: [],
      excelFile : null,
      response : {}
    };
  }

  responseSetting = () => {
    useEffect(() => {
        SendDataToBackend().then(data => {
        data && this.setState({ response : data })
        })
    }, []);
  }

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ excelFile: file }, this.processExcel);
  };

  processExcel = () => {
    const { excelFile } = this.state;
    if (!excelFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const position = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      this.setState({ position });
    };
    reader.readAsBinaryString(excelFile);
  };

//   ParentThatFetches = () => {
//     const [data, updateData] = useState();
//     useEffect(() => {
//       const getData = async () => {
//         const requestData = JSON.stringify(this.state, null, 1);
//         const response = await fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: requestData,
            
//         })
//         .then(updateData(response.json()))
//         getData();      
//     }}, []);

//     return data && <Child data={data} />
//   };    

  sendDataToBackend = () => {
    const jsonData = JSON.stringify(this.state, null, 1);
    const response = fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
      })
      .then((response) => response.json())
      .then((json) => console.log("resonse json = " + json));

    // const [data, setData] = useState({ specie: '', advice: '', quantity: '', price: ''});
    
    // fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: jsonData,
    // })
    //   .then((response) => response.json())
    //   .then((json) => this.setState( {response: json} ))
    //   .then((json) => {
    //     console.log('Data sent to the backend:', jsonData);
    //     console.log('json response= ' + json);
    //     console.log('response= ' + this.state.response);
    //   })
    //   .catch((error) => {
    //     console.error('Error sending data to the backend:', error);
    //   });
  };
    
//     return (
//         <CCard>
//         <CCardHeader>
//           <strong>Outcome FCI Position Advice</strong>
//         </CCardHeader>
//         <CCardBody>
//           <table>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Specie</th>
//                   <th>Advice</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//               {data.map((row) => {
//                 return (<React.Fragment key={row.id}>
//                 <tr>
//                   <td>{row.specieName}</td>
//                   <td>{row.operationAdvice}</td>
//                   <td>{row.quantity}</td>
//                   <td>{row.price}</td>
//                 </tr>    
//                 </React.Fragment>
//               )})}
//               </tbody>
//           </table> 
//       </CCardBody>
//       </CCard>
//     )  
//   };

  render() {
    const { position } = this.state;
    return (
        <CRow>
        <CCol xs={12}>
          <CCard>
          <CCardHeader>
            <strong>Generate FCI Position Advice</strong>
          </CCardHeader>
          <CCardBody>
                <input type="file" onChange={this.handleFileChange} />
                <button onClick={() => this.responseSetting()}>Send Data to Backend</button>
                <br/>
                <div>    
                    <h2>Converted to JSON format Excel Data</h2>
                    <pre>{JSON.stringify(position, null, 2)}</pre>
                </div>
            </CCardBody>
            </CCard>
            
            {/* {this.state.response !== "" ? ( */}
                <CCard>
                <CCardHeader>
                    <strong>Outcome FCI Position Advice</strong>
                </CCardHeader>
                <CCardBody>
                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Specie</th>
                            <th>Advice</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* {this.state.response !== "" && this.response.Bond.map((row) => { */}
                            {/* <React.Fragment key={row.id}> */}
                            {/* return (
                                {console.log("row.specieName = " + row.specieName)}
                                <tr>
                                    <td>{row.specieName}</td>
                                    <td>{row.operationAdvice}</td>
                                    <td>{row.quantity}</td>
                                    <td>{row.price}</td>
                                </tr>    
                            ) */}
                            {/* </React.Fragment> */}
                        {/* }
                        )} */}
                        </tbody>
                    </table> 
                </CCardBody>
                </CCard>
            {/* ) : ""} */}
        </CCol>
        </CRow> 
    );
  }
}

export default fciRegulationPosition;