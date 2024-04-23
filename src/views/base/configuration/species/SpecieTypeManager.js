import React, { useState, useEffect, useRef } from 'react';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilTrash, cilTransfer, cilArrowTop, cilCheckCircle } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './FCIRegulationTable.css';
import './Popup.css';

import 'reactjs-popup/dist/index.css';

import axios from 'axios';

import { isLoginTimestampValid } from '../../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';

import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

class SpecieTypeGroup {
    constructor(id, name, description, updatable) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.updatable = updatable;
    }
}

class SpecieType {
    constructor(id, name, description, updatable) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.updatable = updatable;
    }
}

class Specie {
    constructor(id, specieSymbol, fciSpecieTypeId, specieTypeName) {
        this.id = id;
        this.specieSymbol = specieSymbol;
        this.fciSpecieTypeId = fciSpecieTypeId;
        this.specieTypeName = specieTypeName;
    }
}

function SpecieTypeManager() {
  const [specieTypeGroups, setSpecieTypeGroups] = useState([]);
  const [specieTypes, setSpecieTypes] = useState([]);
  const [currentGroup, setCurrentGroup] = useState({SpecieTypeGroup});
  const [currentSpecieTypeName, setCurrentSpecieTypeName] = useState('');
  const [newSpecieType, setNewSpecieType] = useState({ id: '', name: '', description: '', updatable: ''});
  const [species, setSpecies] = useState([Specie]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSpecies, setTotalSpecies] = useState(1);
  const speciesPerPage = 15;
  const navigate = useNavigate();
  const [updatedSpecie, setUpdatedSpecie] = useState(false);
  const [lastupdatedSpecie, setLastUpdatedSpecie] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);

  /** SpecieType Groups */
  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/');
    }
  
    const fetchSpecieTypeGroups = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group');
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };

    const fetchSpecies = async (specieTypeGroupName, pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind/page/' + pageNumber);
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };

    const fetchTotalSpecies = async (specieTypeGroupName) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedSpecieTypeGroups = await fetchSpecieTypeGroups();
      setSpecieTypeGroups(tempLoadedSpecieTypeGroups);
      if (tempLoadedSpecieTypeGroups.length == 0) {
        setErrorMessage("» There are no Groups defined: Equities, Bonds, Cedears and Cash must be created");
        setShowToast(true);
        setSpecieTypeGroups([]);
        setSpecies([]);
      } else {
        const tempLoadedSpecies = await fetchSpecies(tempLoadedSpecieTypeGroups[0].name, 0);
        const tempLoadedTotalSpecies = await fetchTotalSpecies(tempLoadedSpecieTypeGroups[0].name)
        setCurrentGroup(tempLoadedSpecieTypeGroups[0]);
        setSpecieTypes(tempLoadedSpecieTypeGroups[0].fciSpecieTypes);
        setTotalSpecies(tempLoadedTotalSpecies.length);
        setSpecies(tempLoadedSpecies);
      }
    };
    setFetchedData();
  }, []); 

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    let pPage = pageNumber - 1;
    console.log("url: http://localhost:8098/api/v1/component/specie-type-group/" +  currentGroup.name + '/bind/page/' + pPage);
    const fetchSpecies = async (pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  currentGroup.name + '/bind/page/' + pPage);
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeAssociation:', error);
      }
    };
    const tempLoadedSpecies = await fetchSpecies(pageNumber);
    if (tempLoadedSpecies && tempLoadedSpecies > 0) {
      setSpecies(tempLoadedSpecies);
    } else {
      setSpecies([]);
    }
  };

  /** Specie Type Group */
  const selectSpecieTypeGroup = async (specieTypeGroupName) => {
    const fetchSpecieTypeGroup = async (specieTypeGroupName) => {
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' + specieTypeGroupName);
          return responseData.data;
        } catch (error) {
          console.error('#1 - Error receiving specieTypeGroups:', error);
        }
      };
    const fetchSpecies = async (specieTypeGroupName, specieTypeName) => {
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind/page/0');
          return responseData.data;
        } catch (error) {
          console.error('#1 - Error receiving specieTypeGroups:', error);
        }
      };

    const fetchTotalSpecies = async (specieTypeGroupName) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };
      
    const setFetchedData = async (specieTypeGroupName) => {
      const tempLoadedSpecieTypeGroup = await fetchSpecieTypeGroup(specieTypeGroupName);
      const tempLoadedSpecies = await fetchSpecies(specieTypeGroupName, tempLoadedSpecieTypeGroup.fciSpecieTypes[0].name)
      const tempLoadedTotalSpecies = await fetchTotalSpecies(specieTypeGroupName);
      setCurrentGroup(tempLoadedSpecieTypeGroup);
      setSpecieTypes(tempLoadedSpecieTypeGroup.fciSpecieTypes);
      setSpecies(tempLoadedSpecies);
      setTotalSpecies(tempLoadedTotalSpecies.length);
    }
    setFetchedData(specieTypeGroupName);
  };

  const setCurrentSpecieTypeSelected = (specieTypeName) => {
    setCurrentSpecieTypeName(specieTypeName);
  }

  const upsertSpecieToSpecieTypeAssociation = (specieTypeGroupName, specieTypeName, specieName) => {
    const upsertSpecie = async (specieTypeGroupName, specieTypeName, specieName) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/specie-type/' + specieTypeName + '/specie/' + specieName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#2 - Error upserting association:', error);
        setUpdatedSpecie(false);
      }
    };

    const upsertData = async (specieTypeGroupName, specieTypeName, specieName) => {
      const upsertedSpecie = await upsertSpecie(specieTypeGroupName, specieTypeName, specieName);
      setUpdatedSpecie(true);
      setLastUpdatedSpecie(specieName);
    }
    upsertData(specieTypeGroupName, specieTypeName, specieName);
  }

  const validateNewSpecieTypeRow = (newSpecieType) => {
    const errors = {};
    if (!newSpecieType.name || !newSpecieType.description) {
        errors.name = "Fields are not defined";
    }
    return errors;
  }
  
  const addSpecieType = async () => {
    const errors = validateNewSpecieTypeRow(newSpecieType);
    if (Object.keys(errors).length === 0) {
        const fetchCreatedSpecieType = async () => {
        
                try {
                    const body = new SpecieType(null, newSpecieType.name, newSpecieType.description, newSpecieType.updatable);
                    newSpecieType.fciSpecieTypeId = specieTypes.length + 1;
                    const responseData = await axios.post('http://localhost:8098/api/v1/component/specie-type-group/' + currentGroup.name + '/specie-type', body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    return responseData.data;
                } catch (error) {
                    console.error('Error sending data to the backend:', error);
                }
                
        }
        fetchCreatedSpecieType();
        setSpecieTypes([newSpecieType, ...specieTypes]);
        clearNewSpecieType();
    }
  }

  const clearNewSpecieType = (() => {
    setNewSpecieType({ ...newSpecieType, fciSpecieTypeId: '', name: '', description: '', updatable: '' });
  })

  const deleteSpecieType = () => {

  }

  const showToastMessage = (message) => {
    setErrorMessage(message)
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 10000);
  }

  const toggleToast = () => {
    setShowToast(!showToast);
  };

  return (
    <div>
       <>
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
            <div className="fw-bold me-auto">Position Error Message</div>
            <small>A second ago</small>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
      {specieTypeGroups.length > 0? (
        <>
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">Specie Type Groups Configuration</strong>
              </CCardHeader>
              <CCardBody>
              <table className="text-medium-emphasis small">
               <thead>
                  <tr>
                    <td width="15%"><strong><code>&lt;Specie Type Group&gt;</code></strong></td>
                    <td width="80%">
                      <select className="text-medium-emphasis large" onChange={(e) => selectSpecieTypeGroup(e.target.value)}>
                        {Object.prototype.toString.call(specieTypeGroups) === '[object Array]' && specieTypeGroups?.map((group) => 
                          <React.Fragment key={group.id}>
                          <option value={group.name}>{group.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currentGroup.description}
                    </td>
                  </tr>
                </thead>
               
                <tbody></tbody>
               </table>
               <br/>
               <table className="text-medium-emphasis small"> 
               <tr>
                  {currentGroup.updatable? (
                      <p>
                        &nbsp;<code>*&nbsp;</code>Updatable property refers to the ability to take current prices from market and apply them to a position
                      </p>
                  ) : (null)}
                  </tr>
                </table>
              </CCardBody>
            </CCard>
        </CCol>
      </CRow> 
      <br/>
      <div>
        <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="text-medium-emphasis small">
              <tr>
                <td width="25%">
                   <strong>Specie Types in Group &nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong>
                </td>
                <td>&nbsp;</td>
                <td width="75%">
                    <CPagination align="end" size="sm" className="text-medium-emphasis small"
                    activePage = {currentPage}
                    pages = {Math.floor(totalSpecies / speciesPerPage)}
                    onActivePageChange={handlePageChange}>
                      {currentPage === 1? (
                        <CPaginationItem disabled>«</CPaginationItem> ) 
                      : (<CPaginationItem onClick={() => handlePageChange(currentPage - 1)}>«</CPaginationItem>)}
                      <CPaginationItem active className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage)}>{currentPage}</CPaginationItem>
                      {currentPage === Math.ceil(totalSpecies / speciesPerPage)? (
                        <CPaginationItem disabled>»</CPaginationItem>) 
                      : (<CPaginationItem className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage + 1)}>»</CPaginationItem>)}
                    </CPagination>
                </td>
              </tr>
            </CCardHeader>
            <CCardBody>
              <table>
                <thead>
                  <tr className="text-medium-emphasis">
                    <th>#</th>
                    <th>Specie Symbol</th>
                    <th>Specie Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.prototype.toString.call(species) === '[object Array]' && species?.map((item) => 
                    <React.Fragment key={item.id}>
                    <tr>
                    <td width="5%">{item.id}</td>
                      <td width="5%">{item.specieSymbol}</td>
                      <td width="30%">
                      <select className="text-medium-emphasis large" onChange={(e) => setCurrentSpecieTypeSelected(e.target.value)}>
                        <option>&nbsp;&nbsp;&nbsp;</option> 
                        {Object.prototype.toString.call(specieTypes) === '[object Array]' && specieTypes?.map((specietype) => 
                          <React.Fragment key={specietype.id}>
                           
                          <option value={specietype.name} selected={item.specieTypeName === specietype.name}>{specietype.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                    </td>
                    <td>
                      <CButton component="a" color="string" role="button" size='sm' onClick={() => upsertSpecieToSpecieTypeAssociation(currentGroup.name, currentSpecieTypeName, item.specieSymbol)}>
                            <CIcon icon={cilTransfer} size="xl"/>
                        </CButton>
                        <CButton component="a" color="string" role="button" size='sm' onClick={() => deleteSpecieType()}>
                            <CIcon icon={cilTrash} size="xl"/>
                        </CButton>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {updatedSpecie && item.specieSymbol === lastupdatedSpecie? 
                          <CIcon icon={cilCheckCircle} size="l" />
                        : null}  
                      </td>
                    </tr>
                    </React.Fragment>
                    )}
                </tbody>
              </table>
          </CCardBody>
         </CCard>
        </CCol>
        </CRow> 
      </div> 
      </>
      ) : null}  
      </>
    </div>
  );
}


export default SpecieTypeManager;