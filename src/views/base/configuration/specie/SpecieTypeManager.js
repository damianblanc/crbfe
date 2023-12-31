import React, { useState, useEffect } from 'react';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilTrash, cilTransfer } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './FCIRegulationTable.css';
import './Popup.css';

import 'reactjs-popup/dist/index.css';

import axios from 'axios';

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

  /** SpecieType Groups */
  useEffect(() => {
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
      const tempLoadedSpecies = await fetchSpecies(tempLoadedSpecieTypeGroups[0].name, 0);
      const tempLoadedTotalSpecies = await fetchTotalSpecies(tempLoadedSpecieTypeGroups[0].name);
      setSpecieTypeGroups(tempLoadedSpecieTypeGroups);
      setCurrentGroup(tempLoadedSpecieTypeGroups[0]);
      setSpecieTypes(tempLoadedSpecieTypeGroups[0].fciSpecieTypes);
      setTotalSpecies(tempLoadedTotalSpecies.length);
      setSpecies(tempLoadedSpecies);
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
    setSpecies(tempLoadedSpecies);
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
          const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/specie-type/' + specieTypeName + '/bind/page/0');
          return responseData.data;
        } catch (error) {
          console.error('#1 - Error receiving specieTypeGroups:', error);
        }
      };
      
      const setFetchedData = async (specieTypeGroupName) => {
        const tempLoadedSpecieTypeGroup = await fetchSpecieTypeGroup(specieTypeGroupName);
        const tempLoadedSpecies = await fetchSpecies(specieTypeGroupName, tempLoadedSpecieTypeGroup.fciSpecieTypes[0].name)
        setCurrentGroup(tempLoadedSpecieTypeGroup);
        setSpecieTypes(tempLoadedSpecieTypeGroup.fciSpecieTypes);
        setSpecies(tempLoadedSpecies);
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
      }
    };

    const upsertData = async (specieTypeGroupName, specieTypeName, specieName) => {
      const upsertedSpecie = await upsertSpecie(specieTypeGroupName, specieTypeName, specieName);
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

  return (
    <div>
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
                    <td width="12%"><strong><code>&lt;Specie Type Group&gt;</code></strong></td>
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
                <td>
                   <strong>Specie Types in Group &nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong>
                </td>
                <td width="82%">
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
        <br/>
        <CRow>
        <CCol>
        <CCard>
          <CCardHeader>
            <strong className="text-medium-emphasis small">Add Specie Types to Group</strong>
          </CCardHeader>
          <CCardBody>
            <div className="text-medium-emphasis small">
              Indicate name and description for a new Specie Type to include in current Group <strong><code>&lt;{currentGroup.name}&gt;</code></strong>
            </div>
            <br/>
            <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                        <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                          <input
                            type="text" 
                            value={newSpecieType.name}
                            onChange={(e) => setNewSpecieType({ ...newSpecieType, name: e.target.value })}
                          />
                        </h4>
                    </td>
                    <td colSpan="1">
                      <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                        <input type="text" aria-label="Description"
                          value={newSpecieType.description}
                          onChange={(e) => setNewSpecieType({ ...newSpecieType, description: e.target.value })}/>
                      </h4>
                    </td>
                    <td>&nbsp;</td>
                    <td className="text-medium-emphasis">
                      <CButton component="a" color="string" role="button" size='sm' onClick={() => addSpecieType()}>
                          <CIcon icon={cilTransfer} size="xl"/>
                      </CButton>
                    </td>
                  </tr>
                </tbody>
              </table>  
            </CCardBody>  
        </CCard>  
        </CCol>

       </CRow> 
      </div>   
    </div>
  );
}


export default SpecieTypeManager;