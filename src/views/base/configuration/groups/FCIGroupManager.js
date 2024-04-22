import React, { useState, useEffect, useRef } from 'react';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './FCIRegulationTable.css';
import './Popup.css';

import {CChartPie} from '@coreui/react-chartjs'

import Popup from 'reactjs-popup';
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
    constructor(id, name, description, updatable, specieQuantity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.updatable = updatable;
        this.specieQuantity = specieQuantity;
    }
}

function FCIGroupManager() {
  const [specieTypeGroups, setSpecieTypeGroups] = useState({SpecieType});
  const [specieTypes, setSpecieTypes] = useState([]);
  const [currentGroup, setCurrentGroup] = useState({SpecieTypeGroup});
  const [newSpecieType, setNewSpecieType] = useState({ id: '', name: '', description: '', updatable: true, specieQuantity: 0});
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
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

    const setFetchedData = async () => {
      const tempLoadedSpecieTypeGroups = await fetchSpecieTypeGroups();
      setSpecieTypeGroups(tempLoadedSpecieTypeGroups);
      setCurrentGroup(tempLoadedSpecieTypeGroups[0]);
      setSpecieTypes(tempLoadedSpecieTypeGroups[0].fciSpecieTypes);
    };
    setFetchedData();
  }, []); 

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
   
      const setFetchedData = async (specieTypeGroupName) => {
        const tempLoadedSpecieTypeGroup = await fetchSpecieTypeGroup(specieTypeGroupName);
        setCurrentGroup(tempLoadedSpecieTypeGroup);
        setSpecieTypes(tempLoadedSpecieTypeGroup.fciSpecieTypes);
      }
      setFetchedData(specieTypeGroupName);
  };

  const validateNewSpecieTypeRow = (newSpecieType) => {
    const errors = {};
    if (!newSpecieType.name) {
       errors.composition1 = "Specie Type name is required";
    } 
    if (!newSpecieType.description) {
        errors.composition2 = "Specie Type description is required";
    }
    if (Object.keys(errors).length > 0) {
      const errorMessage = (
        <>
          {errors.composition1 && (
            <>
              {errors.composition1}
              {errors.composition2 && <br />}
            </>
          )}
          {errors.composition2 && <>{errors.composition2}</>}
        </>)
      setErrorMessage(errorMessage);
      setShowToast(true);
      showToastMessage(errorMessage);
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
                  setErrorMessage(error.response.data.message);
                  setShowToast(true);
                  showToastMessage(error.response.data.message);
                  const updatedSpecieTypes = specieTypes.filter(specieType => specieType.id !== specieTypes.length + 1);
                  setSpecieTypes(updatedSpecieTypes);
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

  const deleteSpecieType = (index, specieTypeName) => {
    const doDeleteSpecieType = async (specieTypeName) => {
      try {
        const responseData = await axios.delete('http://localhost:8098/api/v1/component/specie-type-group/' + currentGroup.name + '/specie-type/' + specieTypeName);
        const updatedSpecieTypes = specieTypes.filter(specie => specie.name !== specieTypeName);
        setSpecieTypes(updatedSpecieTypes);
        return responseData.data;
      } catch (error) {
        console.error('#15 - Error trying to delete specie type:', error);
        let errorMsg = error.response.data.message;
        setErrorMessage(errorMsg);
        setShowToast(true);
        showToastMessage(errorMsg);
      }
    };

    const fetchDeleteOutcome = async(specieTypeName) => {
      doDeleteSpecieType(specieTypeName);
    }
    fetchDeleteOutcome(specieTypeName);
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
            <div className="fw-bold me-auto">Specie Type Group Error Message</div>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
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
                    <td>{currentGroup.updatable? (<strong><code>Updatable</code></strong>) 
                                               : (<strong><code>Not Updatable</code></strong>)}
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
              <strong>Specie Types in Group &nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong>
              <Popup trigger={
                <CButton shape='rounded' size='xxl' color='string'>
                    <CIcon icon={cilClipboard} size="xl"/>
                </CButton>} position="right">
                  {<CRow>
                      <CCol xs={30}>
                      <CCard>
                          <CCard className="mb-6">
                          <CCardHeader><strong className="text-medium-emphasis small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Group &nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong></CCardHeader>
                          <CCardBody>
                              <CChartPie
                              data={{
                                  labels: specieTypes?.map((st) => st.name),
                                  datasets: [
                                  {
                                      data: specieTypes?.map((st) => st.specieQuantity),
                                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                  },
                                  ],
                              }}
                              />
                          </CCardBody>
                          </CCard>
                      </CCard> 
                      </CCol>
                    </CRow>}
                </Popup>
            </CCardHeader>
            <CCardBody>
              <table>
                <thead>
                  <tr className="text-medium-emphasis">
                    <th width="5%">#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th># Species</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.prototype.toString.call(specieTypes) === '[object Array]' && specieTypes?.map((item) => 
                    <React.Fragment key={item.id}>
                    <tr>
                      <td width="5%">{item.fciSpecieTypeId}</td>
                      <td width="5%">{item.name}</td>
                      <td width="30%">{item.description}</td>
                      <td>{item.specieQuantity}</td>
                      <td>
                        <CButton component="a" color="string" role="button" size='sm' onClick={() => deleteSpecieType(item.id, item.name)}>
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
            <table className="text-medium-emphasis small">
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
                    <td width="20%">
                        <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                          <input
                            type="text" 
                            style={{width: "90%"}}
                            value={newSpecieType.name}
                            onChange={(e) => setNewSpecieType({ ...newSpecieType, name: e.target.value })}
                          />
                        </h4>
                    </td>
                    <td colSpan="1" width="40%">
                      <h4 className='text-medium-emphasis small'><code>*&nbsp;</code>
                        <input type="text" aria-label="Description"
                          style={{width: "95%"}}
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

export default FCIGroupManager;