import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import EntityCreatorEditor from './EntityCreatorEditor';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { deleteEntity } from '../actions/deleteActions'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { State } from '../types';
import { EntityBase, EntityIdList, EntityList, EntityMetaData, ActionBase, ActionMetaData } from 'blis-models'
import { Modal } from 'office-ui-fabric-react/lib/Modal';

let columns: IColumn[] = [
    {
        key: 'entityName',
        name: 'Entity Name',
        fieldName: 'entityName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'entityType',
        name: 'Entity Type',
        fieldName: 'entityType',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'isBucketable',
        name: 'Bucketable',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'isNegatable',
        name: 'Reversible',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'entityId',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
];
class EntitiesList extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.deleteSelectedEntity = this.deleteSelectedEntity.bind(this);
        this.renderItemColumn = this.renderItemColumn.bind(this)
        this.onChange = this.onChange.bind(this)
        this.renderEntityItems = this.renderEntityItems.bind(this)
        this.state = {
            searchValue: '',
            createEditModalOpen: false,
            entitySelected: null,
            errorModalOpen: false
        }
    }
    deleteSelectedEntity() {
        let currentAppId: string = this.props.apps.current.appId;
        let entityToDelete: EntityBase = this.props.entities.find((a: EntityBase) => a.entityId == this.state.entityIDToDelete)
        this.props.deleteEntity(this.props.userKey, this.state.entityIDToDelete, entityToDelete, currentAppId)
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null
        })

    }
    handleCloseDeleteModal() {
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null,
            errorModalOpen: false
        })
    }
    openDeleteModal(guid: string) {
        let tiedToAction: boolean;
        this.props.actions.map((a: ActionBase) => {
            if(a.negativeEntities.includes(guid) || a.requiredEntities.includes(guid)){
                tiedToAction = true;
                return;
            }
        })
        if (tiedToAction && tiedToAction === true) {
            this.setState({
                errorModalOpen: true
            })
        } else {
            this.setState({
                confirmDeleteEntityModalOpen: true,
                entityIDToDelete: guid
            })
        }
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'isBucketable':
                if (fieldContent.isBucket == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'isNegatable':
                if (fieldContent.isReversable == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(fieldContent)}><span className="ms-Icon ms-Icon--Delete"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    renderEntityItems(): EntityBase[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredEntities = this.props.entities.filter((e: EntityBase) => {
            let nameMatch = e.entityName.toLowerCase().includes(lcString);
            let typeMatch = e.entityType.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch
            return match;
        })
        return filteredEntities;
    }
    onChange(newValue: string) {
        //runs when user changes the text 
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }
    handleOpenCreateModal() {
        this.setState({
            createEditModalOpen: true
        })
    }
    handleCloseCreateModal() {
        this.setState({
            createEditModalOpen: false,
            entitySelected: null
        })
    }
    render() {
        let entityItems = this.renderEntityItems();
        return (
            <div>
                <TrainingGroundArenaHeader title="Entities" description="Manage a list of entities in your application and track and control their instances within actions..." />
                <div className='entityCreator'>
                    <CommandButton
                        data-automation-id='randomID4'
                        disabled={false}
                        onClick={this.handleOpenCreateModal.bind(this)}
                        className='goldButton'
                        ariaDescription='Create a New Entity'
                        text='New Entity'
                    />
                    <EntityCreatorEditor open={this.state.createEditModalOpen} entity={this.state.entitySelected} handleClose={this.handleCloseCreateModal.bind(this)} />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={entityItems}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteEntityModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedEntity()} title="Are you sure you want to delete this entity?" />
                <ConfirmDeleteModal open={this.state.confirmDeleteEntityModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedEntity()} title="Are you sure you want to delete this entity?" />
                <Modal
                    isOpen={this.state.errorModalOpen}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xl ms-fontWeight-semilight'>You cannot delete this entity because it is being used in an action.</span>
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            disabled={false}
                            onClick={() => this.handleCloseDeleteModal()}
                            className='goldButton'
                            ariaDescription='Close'
                            text='Close'
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteEntity: deleteEntity
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        entities: state.entities,
        apps: state.apps,
        actions: state.actions
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntitiesList);