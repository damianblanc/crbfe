import React, { useState, useEffect } from 'react';
import './FCIRegulationTable.css';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilTransfer, cilMediaSkipBackward } from '@coreui/icons';


class FCIRegulation {
  constructor(id, symbol, name, description, composition = [FCIComposition]) {
    this.id = id;
    this.symbol = symbol;
    this.name = name;
    this.description = description;
    this.composition = composition;
  }
}

class FCIComposition {
  constructor(fciCompositionId, fciSpecieTypeId, percentage) {
    this.fciCompositionId = fciCompositionId;
    this.fciSpecieTypeId = fciSpecieTypeId;
    this.percentage = percentage;
  }
}

function findAndSumNumbers (inputString) {
  const numbers = inputString.match(/\d+\.?\d+/g);
  if (numbers) {
    return Math.round(numbers.reduce((acc, num) => acc + parseFloat(num, 10), 0));
  }
};

function FCIRegulationTable() {
  const [data, setData] = useState([{ id: '', symbol: '', name: '', description: '', composition: [FCIComposition]}]);
  const [newRow, setNewRow] = useState({ id: '', symbol: '', name: '', description: '', composition: '' });
  const [editRow, setEditRow] = useState({ id: '', symbol: '', name: '', description: '', composition: '', compositionWithId: '' });
  const [editRowId, setEditRowId] = useState(null);
  const dataAsc = [...data].sort((a, b) => a.id - b.id);
  // const specieTypeAsc = [...data].sort((a, b) => a.specieType > b.specieType ? 1 : -1);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationEditErrors, setValidationEditErrors] = useState({});
  const tableDataToSend = JSON.stringify(data, null, 2);
  const [specieTypes, setSpecieTypes] = useState([{fciSpecieTypeId: '', name: '', description: ''}]);
  // const [sum, setSum] = useState(0);


  const validateNewRow = (row) => {
    const regex = /^(?:[^:]+:\d+(\.\d+)?%)(?:-[^:]+:\d+(\.\d+)?%)*$/;
    const errors = {};
    if (!newRow.symbol) errors.symbol = 'Symbol is required';
    if (!newRow.name) errors.name = 'Name is required';
    if (!newRow.description) errors.description = 'Description is required';
    if (!newRow.composition) { 
        errors.composition1 = 'Composition is required';
    } else if (!regex.test(String(newRow.composition).replace(/\s/g, ''))) {
        errors.composition2 = 'Composition format should be "<Specie Type>:<Percentage Value> + %" separated by hyphens. I/E: Equity:40.5% - Bond:39.5% - Cash:20%';
    }
     
    var w = String(newRow.composition).replace(/\s/g, '').replace(/%/g, '').split(";");
    if (w.length === 1) {
      var sp = w.at(0).split(":").at(0);
      if (!specieTypes.find(element => element.name === sp)) {
        errors.composition3 = 'Composition [' + sp + '] is not a recognized specie type';
      }
    } else {
      w.map((specie) => {
        var sp = specie.split(":").at(0);
        if (!specieTypes.find(element => element.name === sp)) {
          errors.composition4 = 'Composition [' + sp + '] is not a recognized specie type';
        }
      });
    }

    if (findAndSumNumbers(newRow.composition) !== 100) {
      errors.composition5 = 'Composition Percentage must close to 100%';
    };

    return errors;
  };

  const validateEditRow = () => {
    const regex = /^(?:[^:]+:\d+(\.\d+)?%)(?:-[^:]+:\d+(\.\d+)?%)*$/;
    const errors = {};
    if (!editRow.symbol) errors.symbol = 'Symbol is required';
    if (!editRow.name) errors.name = 'Name is required';
    if (!editRow.description) errors.description = 'Description is required';
    if (!editRow.composition) { 
        errors.composition = 'Composition is required';
    } else if (!regex.test(String(editRow.composition).replace(/\s/g, ''))) {
        errors.composition1 = 'Composition format should be "<Specie Type>:<Percentage Value> + %" separated by hyphens. I/E: Equity:40.5% - Bond:39.5% - Cash:20%';
    }
     
    var w = String(editRow.composition).replace(/\s/g, '').replace(/%/g, '').split(";");
    if (w.length === 1) {
      var sp = w.at(0).split(":").at(0);
      if (!specieTypes.find(element => element.name === sp)) {
        errors.composition2 = 'Composition [' + sp + '] is not a recognized specie type';
      }
    } else {
      w.map((specie) => {
      var sp = specie.split(":").at(0);
      if (!specieTypes.find(element => element.name === sp)) {
        errors.composition3 = 'Composition [' + sp + '] is not a recognized specie type';
      }
      })
    };

    if (findAndSumNumbers(editRow.composition) !== 100) {
      errors.composition4 = 'Composition Percentage must close to 100%';
    };

    return errors;
  }

  useEffect(() => {
    fetch('http://localhost:8098/api/v1/fci')
      .then((response) => response.json())
      .then((json) => { 
        setData(json);
        console.table(JSON.stringify(json));
      });
  }, []);

  /** Specie Types retrieving */
  useEffect(() => {
    fetch('http://localhost:8098/api/v1/component/specie-type')
      .then((response) => response.json())
      .then((json) => {
        setSpecieTypes(json);
        console.table(JSON.stringify(json));
      })
  }, []);

  const clearNewRow = (() => {
    setNewRow({ ...newRow, symbol: '', name: '', description: '', composition: '' });
  })

  const handleNewRow = () => {
    const errors = validateNewRow();
    if (Object.keys(errors).length === 0) {
      const f = new FCIRegulation(newRow.id, newRow.symbol, newRow.name, newRow.description, 
        newRow.composition.replace(/\s/g, '').replace(/%/g, '').split("-") 
            .map((c, index) => {
                var r = c.split(":");
                return new FCIComposition(null, findSpecieTypeByName(r.at(0)).fciSpecieTypeId, parseFloat(r.at(1)));
       }));
      

    console.log("JSON.stringify(newRow, null, 1)" + JSON.stringify(f));

    fetch('http://localhost:8098/api/v1/fci', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(f),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log('Backend response:', responseData);
        setData([ ...data, responseData]);
        clearNewRow();
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
    setValidationErrors({});
  } else {
    setValidationErrors(errors);
  }
  };

  const handleDeleteRow = (id, symbol) => {
    console.log("delete symbol = " + symbol);
    fetch(`http://localhost:8098/api/v1/fci/${symbol}`, {
      method: 'DELETE',
    }).then(() => {
      const updatedData = data.filter((row) => row.id !== id);
      setData(updatedData);
    });
  };

  const handleEditRowForward = (row) => {
    setEditRowId(row.id)
    setEditRow({ ...editRow, id: row.id, symbol: row.symbol, name: row.name, description: row.description,
      composition: row.composition.map((c) => c !== undefined && findSpecieTypeById(c.fciSpecieTypeId).name + ": " + c.percentage + "%").join(' - '),
      compositionWithId : row.composition.map((c) => c.id + ":" + c.specieType).join(';')});
  }

  const handleEditRowBack = (id) => {
    setEditRowId(0);
  }

  const handleEditRow = () => {
    const errors = validateEditRow(data.filter((r) => r.id !== editRow.id));
    if (Object.keys(errors).length === 0) {
      const f = new FCIRegulation(editRow.id, editRow.symbol, editRow.name, editRow.description, 
        editRow.composition.replace(/\s/g, '').replace(/%/g, '').split("-") 
            .map((c, index) => {
                var r = c.split(":");
                return new FCIComposition(index + 1, findSpecieTypeByName(r.at(0)).fciSpecieTypeId, parseFloat(r.at(1)));
       }));
      
      fetch('http://localhost:8098/api/v1/fci/' + editRow.symbol + "'", {
        method: 'PUT',
        body: JSON.stringify(f),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(() => {
        setEditRowId(0);
        fetch('http://localhost:8098/api/v1/fci')
          .then((response) => response.json())
          .then((json) => setData(json));
      });
      setValidationEditErrors({});
    } else {
      setValidationEditErrors(errors);
    }
  };

  function findSpecieTypeById(id) {
    if(id === undefined) {return}
    return specieTypes.find((element) => {
      return element.fciSpecieTypeId === id;
    })
  }

  function findSpecieTypeByName(name) {
    if(name === undefined) {return}
    return specieTypes.find((element) => {
      return element.name === name;
    })
  }

  return (
       <CRow>
       <CCol xs={12}>
       
        {Object.keys(validationEditErrors)?.length > 0 ? 
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">There are some errors on FCI Regulation definition</strong>
              </CCardHeader>
              <CCardBody>
                  <div className="validation-errors">
                    {Object.keys(validationEditErrors).map((key) => (
                      <div key={key} className="error">
                        <code>&#187;&nbsp;{validationEditErrors[key]}</code>
                      </div>
                    ))}
                  </div>
              </CCardBody>
            </CCard>
        : null}

        <CCard>
          <CCardHeader>
            <strong>FCI Regulations</strong>
          </CCardHeader>
          <CCardBody>
              <p className="text-medium-emphasis small">
                Refers to a <code>&lt;FCI Regulation List&gt;</code> to performs operations beforehand bias process running
                including their composition
              </p>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataAsc.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr>
                        <td>{row.id}</td>
                        <td>{row.symbol}</td>
                        <td>
                          {editRowId === row.id ? (
                            <input
                              type="text"
                              placeholder={row.name}
                              value={editRow.name}
                              onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
                            />
                          ) : (
                            row.name
                          )}
                        </td>
                        <td>
                          {editRowId === row.id ? (
                            <input
                              type="text"
                              placeholder={row.description}
                              value={editRow.description}
                              onChange={(e) => setEditRow({ ...editRow, description: e.target.value })}
                            />
                          ) : (
                            row.description
                          )}
                        </td>
                        <td>
                          {editRowId === row.id ? (
                            <>
                              <CButton shape='rounded' size='sm' color='string' onClick={() => handleEditRow()}>
                                  <CIcon icon={cilTransfer} size="xl"/>
                              </CButton>

                              <CButton shape='rounded' size='sm' color='string' onClick={() => handleEditRowBack()}>
                                  <CIcon icon={cilMediaSkipBackward} size="xl"/>
                              </CButton>
                            </>
                            ) : (
                              <>
                              <CButton shape='rounded' size='sm' color='string' onClick={ () => handleDeleteRow(row.id, row.symbol)}>
                                  <CIcon icon={cilTrash} size="xl"/>
                              </CButton>&nbsp;
                              <CButton shape='rounded' size='sm' color='string' onClick={ () =>  handleEditRowForward(row)}>
                                  <CIcon icon={cilPencil} size="xl"/>
                              </CButton>
                              </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className='FCIRegulationTable'><b>Composition</b></td>
                        <td colSpan="4">
                          {editRowId === row.id ? (
                            <input
                              type="text"
                              placeholder={row.composition.map((c) =>  + ": " + c.percentage + "% ").join('- ')}
                              value={editRow.composition}
                              onChange={(e) =>
                                setEditRow({ ...editRow, composition: e.target.value })
                              }
                            />
                          ) : (
                            row.composition.map((c) => c.fciSpecieTypeId !== undefined && findSpecieTypeById(c.fciSpecieTypeId).name + ": " + c.percentage + "% ").join('- ')
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
          </CCardBody>
         </CCard>
         <br/>
        {Object.keys(validationErrors)?.length > 0 ? 
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">There are some errors on FCI Regulation definition</strong>
              </CCardHeader>
              <CCardBody>
                  <div className="validation-errors">
                    {Object.keys(validationErrors).map((key) => (
                      <div key={key} className="error">
                        <code>&#187;&nbsp;{validationErrors[key]}</code>
                      </div>
                    ))}
                  </div>
              </CCardBody>
            </CCard>
        : null}

        
         <CCard>
          <CCardHeader>
            <strong>Create a new FCI Regulation</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Indicate symbol, name, description and composition in a new <code>&lt;FCI Regulation&gt;</code> including each specie type and its percentage for further reference
            </p>
            <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td>
                       <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                          <input
                            type="text" value={newRow.symbol}
                            onChange={(e) => setNewRow({ ...newRow, symbol: e.target.value })}/>
                        </h4>
                    </td>   
                    <td>
                        <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                          <input
                            type="text" 
                            value={newRow.name}
                            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                          />
                        </h4>
                    </td>
                    <td className="text-medium-emphasis">
                      <>
                      <CButton component="a" color="string" role="button" size='sm' onClick={() => handleNewRow()}>
                          <CIcon icon={cilTransfer} size="xl"/>
                      </CButton>

                      <CButton component="a" color="string" role="button" size='sm' onClick={() => clearNewRow()}>
                          <CIcon icon={cilTrash} size="xl"/>
                      </CButton>
                      </>
                    </td>
                  </tr>
                  <tr>
                    <td className='FCIRegulationTable'><b>Description</b></td>
                    <td colSpan="4">
                      <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                        <input type="text" aria-label="Description"
                          value={newRow.description}
                          onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}/>
                      </h4>
                    </td>
                  </tr>
                  <tr>
                    <td className='FCIRegulationTable'><b>Composition</b></td>
                    <td colSpan="4">
                      <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                        <input
                          type="text"
                          value={newRow.composition}
                          onChange={(e) => setNewRow({ ...newRow, composition: e.target.value })}/>
                       </h4>   
                    </td>
                  </tr>
                </tbody>
              </table>  
            </CCardBody>  
        </CCard>      
       </CCol>
     </CRow>   
  );
};

export default FCIRegulationTable;