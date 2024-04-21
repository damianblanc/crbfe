import React, { useState, useEffect, useRef } from 'react';
import './FCIRegulationTable.css';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilTransfer, cilMediaSkipBackward, cilFile, cilListFilter } from '@coreui/icons';

import { CChartBar, CChartPie} from '@coreui/react-chartjs'

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import axios from 'axios';

import { CModal } from '@coreui/react';
import { element } from 'prop-types';
import { NumericFormat } from 'react-number-format';
import { isLoginTimestampValid } from '../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';
import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'


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
  constructor(id, specieTypeId, specieTypeName, percentage) {
    this.id = id;
    this.fciSpecieTypeId = specieTypeId;
    this.fciSpecieTypeName = specieTypeName;
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
  const [regulations, setRegulations] = useState([{ id: '', symbol: '', name: '', description: '', composition: [FCIComposition]}]);
  const [newRow, setNewRow] = useState({ id: '', symbol: '', name: '', description: '', composition: '' });
  const [editRow, setEditRow] = useState({ id: '', symbol: '', name: '', description: '', composition: '', compositionWithId: '' });
  const [editRowId, setEditRowId] = useState(null);
  // const dataDesc = [...regulations].sort((a, b) => b.id - a.id);
  // const specieTypeAsc = [...data].sort((a, b) => a.specieType > b.specieType ? 1 : -1);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationEditErrors, setValidationEditErrors] = useState({});
  const tableDataToSend = JSON.stringify(regulations, null, 2);
  const [specieTypes, setSpecieTypes] = useState([{fciSpecieTypeId: '', name: '', description: ''}]);
  const [regulationPercentages, setRegulationPercentages] = useState([]);
  const [visible, setVisible] = useState(false);
  const [searchFiltered, setSearchFiltered] = useState(false);
  const [totalRegulations, setTotalRegulations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCurrentRegulationSymbol, setSearchCurrentRegulationSymbol] = useState('');
  const regulationsPerPage = 5;
  const navigate = useNavigate();
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateNewRow = (row) => {
    const regex = /^(?:[^:]+:\d+(\.\d+)?%)(?:-[^:]+:\d+(\.\d+)?%)*$/;
    const compositions = ['symbol', 'name', 'description', 'composition1', 'composition2', 'composition3', 'composition4', 'composition5', 'composition6', 'composition7'];
    const errors = {};

    if (!newRow.symbol) errors.symbol = '» Symbol is required';
    if (!newRow.name) errors.name = '» Name is required';
    if (!newRow.description) errors.description = '» Description is required';
    if (!newRow.composition) { 
        errors.composition1 = '» Composition is required';
    } else if (!regex.test(String(newRow.composition).replace(/\s/g, ''))) {
        errors.composition2 = '» Composition format should be "<Specie Type>:<Percentage Value> + %" separated by hyphens. I/E: Equity:40.5% - Bond:39.5% - Cash:20%';
    }
     
    var w = String(newRow.composition).replace(/\s/g, '').replace(/%/g, '').split("-");
    if (w.length === 1) {
      var sp = w.at(0).split(":").at(0);
      if (sp.toLowerCase() !== 'cash') {
        errors.composition5 = '» Composition [Cash] is not defined';
      }
      if (!specieTypes.find(element => element.name.toLowerCase() === sp.toLowerCase())) {
        errors.composition3 = '» Composition [' + sp + '] is not a recognized specie type';
      }
    } else {
      let notCash = false;
      w.map((specie) => {
        var sp = specie.split(":").at(0);
        if (!specieTypes.find(element => element.name.toLowerCase() === sp.toLowerCase())) {
          errors.composition4 = '» Composition [' + sp + '] is not a recognized specie type';
        }
        notCash = notCash || sp.toLowerCase() === 'cash';
      });
      if (!notCash) {
        errors.composition5 = '» Composition [Cash] is not defined';
      }
    }

    const arry = [];
    for(var i = 0; i < w.length; i++) {
        arry[i] = w[i].split(":").at(0);
    }
    const duplicatedElements = toFindDuplicates(arry);
    if (duplicatedElements.length > 0) {
      errors.composition6 = '» Composition has duplicated [' + duplicatedElements + '] specie types defined';
    }

    if (findAndSumNumbers(newRow.composition) !== 100) {
      errors.composition7 = '» Composition Percentage must close to 100%';
    };

    generateErrorMessage(errors, compositions);
    if (Object.keys(errors).length > 0) {
      const errorComponents = generateErrorMessage(errors, compositions);
    
      const errorMessage = (
        <>
          {errorComponents}
        </>
      );
    
      setErrorMessage(errorMessage);
      setShowToast(true);
      showToastMessage(errorMessage);
    }

    return errors;
  };

  function toFindDuplicates(arry) {
    const uniqueElements = new Set(arry);
    const filteredElements = arry.filter(item => {
        if (uniqueElements.has(item)) {
            uniqueElements.delete(item);
        } else {
            return item;
        }
    });

    return [...new Set(filteredElements)]
  } 

  const validateNewSpecieTypeRow = () => {
    const regex = /^(?:[^:]+:\d+(\.\d+)?%)(?:-[^:]+:\d+(\.\d+)?%)*$/;
    const compositions = ['symbol', 'name', 'description', 'composition1', 'composition2', 'composition3', 'composition4', 'composition5', 'composition6'];
    const errors = {};

    if (!editRow.symbol) errors.symbol = '» Symbol is required';
    if (!editRow.name) errors.name = '» Name is required';
    if (!editRow.description) errors.description = '» Description is required';
    if (!editRow.composition) { 
        errors.composition1 = '» Composition is required';
    } else if (!regex.test(String(editRow.composition).replace(/\s/g, ''))) {
        errors.composition2 = '» Composition format should be "<Specie Type>:<Percentage Value> + %" separated by hyphens. I/E: Equity:40.5% - Bond:39.5% - Cash:20%';
    }
     
    var w = String(editRow.composition).replace(/\s/g, '').replace(/%/g, '').split("-");
    if (w.length === 1) {
      var sp = w.at(0).split(":").at(0);
      if (sp.toLowerCase() !== 'cash') {
        errors.composition5 = '» Composition [Cash] is not defined';
      }
      if (!specieTypes.find(element => element.name.toLowerCase() === sp.toLowerCase())) {
        errors.composition3 = '» Composition [' + sp + '] is not a recognized specie type';
      }
    } else {
      let notCash = false;
      w.map((specie) => {
      var sp = specie.split(":").at(0);
      if (!specieTypes.find(element => element.name === sp)) {
        errors.composition3 = '» Composition [' + sp + '] is not a recognized specie type';
      }
      notCash = notCash || sp.toLowerCase() === 'cash';
      })
      if (!notCash) {
        errors.composition4 = '» Composition [Cash] is not defined';
      }
    };

    const arry = [];
    for(var i = 0; i < w.length; i++) {
        arry[i] = w[i].split(":").at(0);
    }
    const duplicatedElements = toFindDuplicates(arry);
    if (duplicatedElements.length > 0) {
      errors.composition5 = '» Composition has duplicated [' + duplicatedElements + '] specie types defined';
    }

    if (findAndSumNumbers(editRow.composition) !== 100) {
      errors.composition6 = '» Composition Percentage must close to 100%';
    };

    generateErrorMessage(errors, compositions);
    if (Object.keys(errors).length > 0) {
      const errorComponents = generateErrorMessage(errors, compositions);
    
      const errorMessage = (
        <>
          {errorComponents}
        </>
      );
    
      setErrorMessage(errorMessage);
      setShowToast(true);
      showToastMessage(errorMessage);
    }
    return errors;
  }

  const validateEditRow = (newSpecieType) => {
    const errors = {};
    const compositions = ['symbol', 'name', 'description', 'composition1', 'composition2', 'composition3', 'composition4', 'composition5', 'composition6', 'composition7'];
    const regex = /^(?:[^:]+:\d+(\.\d+)?%)(?:-[^:]+:\d+(\.\d+)?%)*$/;
  
    if (!editRow.symbol) errors.symbol = '» Symbol is required';
    if (!editRow.name) errors.name = '» Name is required';
    if (!editRow.description) errors.description = '> Description is required';
    if (!editRow.composition) { 
      errors.composition1 = '> Composition is required';
    } else if (!regex.test(String(editRow.composition).replace(/\s/g, ''))) {
      errors.composition2 = '» Composition format should be "<Specie Type>:<Percentage Value> + %" separated by hyphens. I/E: Equity:40.5% - Bond:39.5% - Cash:20%';
    }

    var w = String(editRow.composition).replace(/\s/g, '').replace(/%/g, '').split("-");
    if (w.length === 1) {
      var sp = w.at(0).split(":").at(0);
      if (sp.toLowerCase() !== 'cash') {
        errors.composition5 = '» Composition [Cash] is not defined';
      }
      if (!specieTypes.find(element => element.name.toLowerCase() === sp.toLowerCase())) {
        errors.composition3 = '» Composition [' + sp + '] is not a recognized specie type';
      }
    } else {
      let notCash = false;
      w.map((specie) => {
      var sp = specie.split(":").at(0);
      if (!specieTypes.find(element => element.name === sp)) {
        errors.composition3 = '» Composition [' + sp + '] is not a recognized specie type';
      }
      notCash = notCash || sp.toLowerCase() === 'cash';
      })
      if (!notCash) {
        errors.composition5 = '» Composition [Cash] is not defined';
      }
    };

    const arry = [];
    for(var i = 0; i < w.length; i++) {
        arry[i] = w[i].split(":").at(0);
    }
    const duplicatedElements = toFindDuplicates(arry);
    if (duplicatedElements.length > 0) {
      errors.composition6 = '» Composition has duplicated [' + duplicatedElements + '] specie types defined';
    }

    if (findAndSumNumbers(editRow.composition) !== 100) {
      errors.composition4 = '» Composition Percentage must close to 100%';
    };
    
    generateErrorMessage(errors, compositions);
    if (Object.keys(errors).length > 0) {
      const errorComponents = generateErrorMessage(errors, compositions);
    
      const errorMessage = (
        <>
          {errorComponents}
        </>
      );
    
      setErrorMessage(errorMessage);
      setShowToast(true);
      showToastMessage(errorMessage);
    }
    return errors;
  }

  const generateErrorMessage = (errors, compositions) => {
    return compositions.map((comp, index) => {
      if (errors[comp]) {
        return (
          <>
            {errors[comp]}
            {index < compositions.length - 1 && <br />}
          </>
        );
      }
      return null;
    });
  };

  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/');
    }

    const fetchRegulations = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/page/0/page_size/' + regulationsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchSpecieTypes = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchTotalRegulations = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      if (tempLoadedRegulations.length > 0) {
        const tempLoadedSpecieTypes = await fetchSpecieTypes(tempLoadedRegulations[0].fciSymbol);
        const tempLoadedTotalRegulations = await fetchTotalRegulations();
        setRegulations(tempLoadedRegulations);
        setSpecieTypes(tempLoadedSpecieTypes);
        setTotalRegulations(tempLoadedTotalRegulations.length);
      } else {
        setRegulations([]);
      }
    };
    setFetchedData();
  }, []); 

  const clearNewRow = (() => {
    setNewRow({ ...newRow, fciSymbol: '', name: '', description: '', composition: '' });
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
        setRegulations([ responseData, ...regulations]);
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
      const updatedData = regulations.filter((row) => row.id !== id);
      setRegulations(updatedData);
    });
  };

  const handleEditRowForward = (row) => {
    setEditRowId(row.id)
    setEditRow({ ...editRow, id: row.id, symbol: row.fciSymbol, name: row.name, description: row.description,
      composition: row.composition.map((c) => c !== undefined && findSpecieTypeById(c.id + 1).name + ": " + c.percentage + "%").join(' - '),
      compositionWithId : row.composition.map((c) => c.id + ":" + c.specieType).join(' - ')});
      setValidationEditErrors({});  
  }

  const handleEditRowBack = (id) => {
    setEditRowId(0);
  }

  const handleEditRow = () => {
    const errors = validateEditRow(regulations.filter((r) => r.id !== editRow.id));
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
          .then((json) => setRegulations(json));
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
      return element.name.toLowerCase() === name.toLowerCase();
    })
  }

  const listFCIRegulationPercentages = async (fciSymbol) => {
    setVisible(!visible);
    try {
      const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/regulation-percentages')
      setRegulationPercentages(responseData.data);
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    let pPage = pageNumber - 1;
    console.log("url: http://localhost:8098/api/v1/fci/page/" + pPage + '/page_size/' + regulationsPerPage);
    const fetchPositions = async (pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/page/' + pPage + '/page_size/' + regulationsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeAssociation:', error);
      }
    };
    const tempLoadedPositions = await fetchPositions(pageNumber);
    setRegulations(tempLoadedPositions);
  };

  const handleSearchRegulationSymbolChange = (fciSymbol) => {
    setSearchCurrentRegulationSymbol(fciSymbol);
    setSearchFiltered(!searchFiltered);
  }

  const filterRegulationList = async () => {
    const fetchFilteredPosition = async () => {
      try {
        if (searchCurrentRegulationSymbol !== "") {
          const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + searchCurrentRegulationSymbol + '/filtered');
          return responseData.data;
        } else {
          const responseData = await axios.get('http://localhost:8098/api/v1/fci/page/' + 0 + '/page_size/' + regulationsPerPage);
          return responseData.data;
        }
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    }
    const tempLoadedRegulations = await fetchFilteredPosition();
    if (searchCurrentRegulationSymbol !== "") {  
      if (tempLoadedRegulations.length > 0) {
        setRegulations(tempLoadedRegulations);
        setTotalRegulations(tempLoadedRegulations.length);
      } else {
        const tempLoadedTotalRegulations = await fetchTotalRegulations();
        setTotalRegulations(tempLoadedTotalRegulations.length);
      }
    } else {
      setRegulations(tempLoadedRegulations);
    }
  };

  const fetchTotalRegulations = async (fciSymbol) => {
    try {
      const responseData = await axios.get('http://localhost:8098/api/v1/fci');
      return responseData.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  };

  const showToastMessage = (message) => {
    setErrorMessage(message)
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 20000);
  }

  const toggleToast = () => {
    setShowToast(!showToast);
  };

  return (
    <div>
    {showToast === true?
      <CToaster classname='p-3' placement='top-end' push={toast} ref={toaster}>
        <CToast show={true} animation={true} autohide={true} 
              fade={true} visible={true} onClose={toggleToast}>
          <CToastHeader closeButton>
            <svg
              className="rounded me-2"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              role="img"
            >
            <rect width="100%" height="100%" fill="#FF0000"></rect>
            </svg>
            <div className="fw-bold me-auto">Regulation Manager Error Message</div>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
       <CRow>
       <CCol xs={12}>

        <CCard>
          <CCardHeader className="text-medium-emphasis small">
          <strong>Configure & Create FCI Regulations</strong>
          </CCardHeader>
          <CCardBody>
              <p className="text-medium-emphasis small">
                Refers to a <code>&lt;FCI Regulation List&gt;</code> to performs operations beforehand bias process running
                including their composition
              </p>
             
                <table style={{border: 'none'}}>
                {totalRegulations > 0? (
                  <tr className="text-medium-emphasis small">
                    <td width="20%">Regulation Symbol #</td>
                    <td width="20%">
                       <input className="text-medium-emphasis small" type="text"
                          style={{width: "100%"}}
                          onChange={(e) => handleSearchRegulationSymbolChange(e.target.value)}/>
                    </td>
                    <td>
                    <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => filterRegulationList()}>
                            <CIcon icon={cilListFilter} size="xl"/>
                      </CButton>
                    </td>
                    {/* <td width="5%"></td>
                    <td width="20%">Date From</td>
                    <td>
                      <input type="text" className="text-medium-emphasis small"
                          onChange={(e) => handleSearchDateFromChange(e.target.value)}/>
                    </td>
                    <td width="5%"></td>
                    <td width="20%">Date To</td>
                    <td width="10%"> */}
                      {/* <CDateRangePicker startDate="2022/08/03" endDate="2022/08/17" label="Date range" locale="en-US" /> */}
                    {/* </td> */}
                      {/* <input type="text" className="text-medium-emphasis small"
                          onChange={(e) => handleSearchDateToChange(e.target.value)}/> */}
                  
                    <td>
                    <CPagination align="end" size="sm" className="text-medium-emphasis small"
                    activePage = {currentPage}
                    pages = {Math.floor(totalRegulations / regulationsPerPage)}
                    onActivePageChange={handlePageChange}>
                      {currentPage === 1? (
                        <CPaginationItem className="text-medium-emphasis small" disabled>«</CPaginationItem> ) 
                      : (<CPaginationItem className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage - 1)}>«</CPaginationItem>)}
                     
                      <CPaginationItem active className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage)}>{currentPage}</CPaginationItem>
                     
                      {currentPage === Math.ceil(totalRegulations / regulationsPerPage) || searchFiltered ? (
                        <CPaginationItem className="text-medium-emphasis small" disabled>»</CPaginationItem>) 
                      : (<CPaginationItem className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage + 1)}>»</CPaginationItem>)}
                    </CPagination>
                </td>
                  </tr>
                  ) : null}
              </table>

              <table className="text-medium-emphasis small">
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
                  {Object.prototype.toString.call(regulations) === '[object Array]' && regulations.length > 0 && regulations.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr>
                        <td>{row.id}</td>
                        <td><code>{row.fciSymbol}</code></td>
                        <td>
                          {editRowId === row.id ? (
                            <input
                              type="text"
                              style={{width: "100%"}}
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
                              style={{width: "100%"}}
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
                              <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => handleEditRow()}>
                                  <CIcon icon={cilTransfer} size="xl"/>
                              </CButton>

                              <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => handleEditRowBack()}>
                                  <CIcon icon={cilMediaSkipBackward} size="xl"/>
                              </CButton>
                            </>
                            ) : (
                              <>
                              <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={ () => handleDeleteRow(row.id, row.symbol)}>
                                  <CIcon icon={cilTrash} size="xl"/>
                              </CButton>&nbsp;
                              <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={ () =>  handleEditRowForward(row)}>
                                  <CIcon icon={cilPencil} size="xl"/>
                              </CButton>
                              </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className='FCIRegulationTable'><b>Composition</b></td>
                        <td colSpan="3">
                          {editRowId === row.id ? (
                            <input
                              type="text"
                              style={{width: "100%"}}
                              placeholder={row.composition.map((c) =>  + ": " + c.percentage + "% ").join('- ')}
                              value={editRow.composition}
                              onChange={(e) =>
                                setEditRow({ ...editRow, composition: e.target.value })
                              }
                            />
                          ) : (
                            row.composition.map((c) => c.specieTypeId !== undefined &&
                              <React.Fragment key={c.specieTypeId}>
                                {findSpecieTypeById(c.specieTypeId).name}{": "}
                                <b>
                                <NumericFormat displayType="text" value={Number(c.percentage).toFixed(2)} suffix="%"/>
                                </b>
                                {' - '}
                            </React.Fragment>
                            ))}
                        </td>
                        <td>
                        {/* <CButton onClick={() => setVisible(!visible)}>Launch demo modal</CButton> */}
                          <CButton shape='rounded' size='sm' color='string' onClick={() => listFCIRegulationPercentages(row.fciSymbol)}>
                            <CIcon icon={cilFile} size="xl"/>
                        </CButton>
                        <div>{() => listFCIRegulationPercentages(row.fciSymbol)}</div>
                        <CModal
                          visible={visible}
                          alignment="center"
                          size = "xl"
                          onClose={() => setVisible(false)}
                          aria-labelledby="ScrollingLongContentExampleLabel"
                        >
                        {<CRow>
                          <CCol xs={18}>
                            <CCard>
                              <CCardHeader>
                                <strong className="text-medium-emphasis small">FCI Regulation Composion - {row.fciSymbol}</strong>
                              </CCardHeader>
                              <CCardBody>
                              <CRow>
                              <CCol xs={4}>
                                  <CCard className="mb-4">
                                    <CCardHeader>Expected FCI Regulation Definition</CCardHeader>
                                    <CCardBody>
                                      <CChartPie
                                        data={{
                                          labels: regulationPercentages?.map((p) => p.specieType),
                                          datasets: [
                                            {
                                              data: regulationPercentages?.map((p) => p.percentage),
                                              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                            },
                                          ],
                                        }}
                                      />
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                                <CCol xs={8}>
                                <CCard className="mb-4">
                                    <CCardHeader>FCI Regulation Composition</CCardHeader>
                                    <CCardBody>
                                        <table  className="text-medium-emphasis">
                                        <thead>
                                            <tr className="text-medium-emphasis">
                                              <th>Specie Type</th>
                                              <th>Percentage</th>
                                            </tr>  
                                          </thead>  
                                          <tbody>
                                            {regulationPercentages?.map((p) => 
                                             <React.Fragment key={p.id}>
                                              <tr className="text-medium-emphasis">
                                                <td>{p.specieType}</td>
                                                <td>{p.percentage}</td>
                                              </tr>
                                             </React.Fragment> 
                                            )}                                       
                                          </tbody>
                                        </table>
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                               </CRow>   
                            </CCardBody>
                            </CCard> 
                          </CCol>
                         </CRow>  }
                         </CModal>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
          </CCardBody>
         </CCard>
         <br/>

         <CCard>
          <CCardHeader className="text-medium-emphasis small">
            <strong>Create a new FCI Regulation</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Indicate symbol, name, description and composition in a new <code>&lt;FCI Regulation&gt;</code> including each specie type and its percentage for further reference
            </p>
            <table className="text-medium-emphasis small">
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
                            style={{width: "100%"}}
                            onChange={(e) => setNewRow({ ...newRow, symbol: e.target.value })}/>
                        </h4>
                    </td>   
                    <td>
                        <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                          <input
                            type="text" 
                            style={{width: "100%"}}
                            value={newRow.name}
                            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                          />
                        </h4>
                    </td>
                    <td className="text-medium-emphasis">
                      <>
                      <CButton className="text-medium-emphasis small" component="a" color="string" role="button" size='sm' onClick={() => handleNewRow()}>
                          <CIcon icon={cilTransfer} size="xl"/>
                      </CButton>

                      <CButton className="text-medium-emphasis small" component="a" color="string" role="button" size='sm' onClick={() => clearNewRow()}>
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
                         style={{width: "100%"}}
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
                          style={{width: "100%"}}
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
    </div>
  );
};

export default FCIRegulationTable;