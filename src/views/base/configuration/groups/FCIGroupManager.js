import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilIndustry, cilAlignRight, cilBookmark, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer, cibSlides } from '@coreui/icons';

import CIcon from '@coreui/icons-react'
import { CModal } from '@coreui/react';

import './FCIGroupManager.css';
import './Popup.css';

import {CChartBar, CChartPie, CChart} from '@coreui/react-chartjs'

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import api from './../../../config.js';

import { isLoginTimestampValid } from '../../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';
import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

class SpecieTypeGroup {
    constructor(id, name, description, lot, updatable) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.lot = lot;
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
  const [visibleAdd, setVisibleAdd] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const urlParam = new URLSearchParams(location.search).get('url');
    if (urlParam) {
      api.defaults.baseURL = urlParam;
    }
  }, [location]);

  /** SpecieType Groups */
  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/');
    }

    const currentPage = document.location.pathname;
    localStorage.setItem('currentPage', currentPage);
    const previousPage = localStorage.getItem("previousPage");
    if (currentPage !== previousPage) {
        localStorage.setItem('previousPage', currentPage);
        window.location.reload();
    }

    const fetchSpecieTypeGroups = async () => {
      try {
        const responseData = await api.get('/api/v1/component/specie-type-group');
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
      } else {
        setCurrentGroup(tempLoadedSpecieTypeGroups[0]);
        setSpecieTypes(tempLoadedSpecieTypeGroups[0].fciSpecieTypes);
      }
    };
    setFetchedData();
  }, []); 

  /** Specie Type Group */
  const selectSpecieTypeGroup = async (specieTypeGroupName) => {
    const fetchSpecieTypeGroup = async (specieTypeGroupName) => {
        try {
          const responseData = await api.get('/api/v1/component/specie-type-group/' + specieTypeGroupName);
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
                    const responseData = await api.post('/api/v1/component/specie-type-group/' + currentGroup.name + '/specie-type', body,
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
        setVisibleAdd(false);
    }
  }

  const clearNewSpecieType = (() => {
    setNewSpecieType({ ...newSpecieType, fciSpecieTypeId: '', name: '', description: '', updatable: '' });
  })

  const deleteSpecieType = (index, specieTypeName) => {
    const doDeleteSpecieType = async (specieTypeName) => {
      try {
        const responseData = await api.delete('/api/v1/component/specie-type-group/' + currentGroup.name + '/specie-type/' + specieTypeName);
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

  const showAddGroupCanvas = () => {
    setVisibleAdd(!visibleAdd);
  }

  return (
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
            <div className="fw-bold me-auto">Specie Type Group Error Message</div>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
      {specieTypeGroups.length > 0? (
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
              {<Popup trigger={
                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string'>
                      <CIcon icon={cilBookmark} size="xl"/>
                  </CButton>} position="right" modal lockScroll="false" backgroundColor="rgba(75,192,192,0.4)"
                   contentStyle={{ width: "60%", height: "65%", overflow: "auto", position: 'absolute', top: '19%', left: '21%'}}>
                  {
                    <CRow>
                    <CCol xs={12}>
                      <CCard>
                        <CCardHeader>
                          <strong className="text-medium-emphasis small">FCI Specie Type Group Management</strong>
                        </CCardHeader>
                        <CCardBody>
                        <CRow>
                          <CCol>
                          <p className="text-medium-emphasis small">» The Group Management page is design to manage and view information related to Specie Type Groups and Specie Types.</p>
                          <p className="text-medium-emphasis small">» Upon loading, the page fetches all available Specie Type Groups. If there are no groups found, an error message is displayed. Otherwise, the first group is selected by default, and its Specie Types are shown.</p>
                          <p className="text-medium-emphasis small">» Different Specie Type Group can be selected from a dropdown list to view its Specie Types. For each Specie Type, details such as its name, description, and the number of species it contains are displayed. The ability to delete a Specie Type from its group is also accepted, but it is important to understand restrictions to this deletion once specie type is referenced from any position.</p>
                          <p className="text-medium-emphasis small">» In addition, a new Specie Type can be added to the current group. To do so, they need to provide a name and description for the new Specie Type. If the provided information is valid, the new Specie Type is added to the group. Otherwise, an error message is displayed.</p>
                          <p className="text-medium-emphasis small">» There is also a popup window that provides detailed information about specie types distribution in group.</p>
                          <p className="text-medium-emphasis small">» Any error messages that occur during the use of this page are displayed as toast notifications.</p>
                          </CCol>
                        </CRow>
                      </CCardBody>
                      </CCard>
                      </CCol>
                      </CRow>}
                      </Popup>}
                <strong className="text-medium-emphasis small">Specie Type Groups Configuration</strong>
              </CCardHeader>
              <CCardBody>  
              <table className="text-medium-emphasis small">
               <thead>
                  <tr>
                    <td width="15%"><strong><code>&lt;Specie Type Group&gt;</code></strong></td>
                    <td width="15%">
                      <select className="text-medium-emphasis large" onChange={(e) => selectSpecieTypeGroup(e.target.value)}>
                        {Object.prototype.toString.call(specieTypeGroups) === '[object Array]' && specieTypeGroups?.map((group, index) => 
                          <React.Fragment key={group.id || index}>
                          <option value={group.name}>{group.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                    </td>
                    <td width="50%">
                       {currentGroup.description}
                    </td>
                    <td>
                      <table className="text-medium-emphasis small" width="10%" style={{ marginTop: "1px"}}>
                        <thead>
                          <tr>
                            <th className="text-medium-emphasis large" colSpan={2} style={{ textAlign:'center', border: '1px solid lightgrey' }}>Properties</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid lightgrey', color: 'green' }}>&nbsp;&nbsp;Market Refresh&nbsp;&nbsp;</td>
                            <td className="small" style={{ border: '1px solid lightgrey', color: 'green' }}>{currentGroup.updatable? (<strong>&nbsp;&nbsp;Yes&nbsp;&nbsp;</strong>) 
                                                      : (<strong>&nbsp;&nbsp;No&nbsp;&nbsp;</strong>)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid lightgrey', color: '#000080' }}>&nbsp;&nbsp;Papers per Lot&nbsp;&nbsp;</td>
                            <td className="large" style={{ border: '1px solid lightgrey', color: '#000080' }}>&nbsp;&nbsp;{currentGroup.lot}&nbsp;&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                   <td width="2%"></td>
                   </tr> 
              </thead>
              </table>
              </CCardBody>
            </CCard>
        </CCol>
      </CRow> 
      ) : null}
      <br/>
        {specieTypeGroups.length > 0? (
        <CRow>
        <CCol xs={12}>
          <CCard>
          <CCardHeader className="text-medium-emphasis small d-flex align-items-center" style={{ padding: '0.5rem 1rem', lineHeight: '3rem' }}>
              &nbsp;&nbsp;&nbsp;<CIcon icon={cilAlignRight} size="xl"/>&nbsp;&nbsp;&nbsp;
              <strong>Specie Types in Group &nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong>
              <Popup trigger={
                <CButton shape='rounded' size='lg' color='string'>
                    <CIcon className="text-medium-emphasis small" icon={cilClipboard} size="lg"/>
                </CButton>} position="right" contentStyle={{ width: '40%', height: '47.5%', top: '40%' }}>
                  {<CRow>
                    <CCol xs={20}>
                      <CCard className="mb-4">
                        <CCardHeader className="text-medium-emphasis small">
                          <tbody>
                          <table>
                            <tbody>
                              <tr>
                                <td>
                                <strong><CIcon icon={cilBookmark} size="lg" className="d-flex align-items-center"/></strong>
                                </td>
                                <td>
                                <strong>&nbsp;Group&nbsp;&nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          </tbody>
                        </CCardHeader>
                        <CCardBody>
                            <CChart
                              type="bar"
                              data={{
                                  labels: specieTypes?.map((st) => st.name),
                                  datasets: [
                                  {
                                    label: 'Specie Types in Group',
                                      data: specieTypes?.map((st) => st.specieQuantity),
                                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                  },
                                  ]
                                }}
                                labels="Specie Types in Group"
                                options={{
                                  title: {
                                    display: false,
                                    text: 'Specie Types in Group',
                                  },
                                  aspectRatio: 2,
                                  tooltips: {
                                    enabled: true,
                                  },
                                }}/>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>}
                </Popup>
                  <td style={{ width: "1%", border: "none"}}>
                      <CButton className="text-medium-emphasis small"
                        shape='rounded' size='sm' color='string' onClick={() => showAddGroupCanvas()}>
                          <CIcon icon={cilNoteAdd} size="xl"/>
                      </CButton>
                  </td>
                  <CModal
                        visible={visibleAdd}
                        alignment="center"
                        size = "lg"
                        onClose={() => setVisibleAdd(false)}
                        aria-labelledby="ScrollingLongContentExampleLabel">
                      {
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
                      }  
                </CModal>  
            </CCardHeader>
            <CCardBody>
              <table className="text-medium-emphasis small">
                <thead>
                  <tr className="text-medium-emphasis small">
                    <th width="5%">#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th># Species</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.prototype.toString.call(specieTypes) === '[object Array]' && specieTypes?.map((item, index) => 
                    <React.Fragment key={item.id || index}>
                    <tr>
                      <td width="5%" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.fciSpecieTypeId}</td>
                      <td width="5%" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.name}</td>
                      <td width="30%">{item.description}</td>
                      <td className="large" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.specieQuantity}</td>
                      <td>
                        <CButton component="a" color="string" role="button" size='sm' onClick={() => deleteSpecieType(item.id, item.name)}>
                            <CIcon className="text-medium-emphasis small" icon={cilTrash} size="xl"/>
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
        ) : null}
      <br/>
    </>
  );
}

export default FCIGroupManager;