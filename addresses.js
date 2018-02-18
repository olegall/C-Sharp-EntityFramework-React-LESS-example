'use strict';

import '../../../../../less/pages/company/settings/addresses.less';
import React from 'react';
import ReactDom from 'react-dom';
import Grid from '../../../components/grid/grid.js';
import Loader from '../../../components/loader.js';
import { showSuccess, showError, showWarning } from '../../../components/alert.js';
import { Select, VirtualizedSelect } from '../../../components/select.js';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

let deleteAddress;
let cancelIcon;

const rowsCount = 22;

class IconsColumn extends React.PureComponent {
    
    _deleteClick(id) {
        deleteAddress(id);
    }
    
    _cancelIconClick() {
        cancelIcon();
    }

    render() {
        if (!this.props.rowData.id) {
            return (<div>
                        <a onClick={this._cancelIconClick.bind(this)} className="cancel-icon" title={strings.Cancel}>
                            <span className="glyphicon glyphicon-ban-circle"></span>
                        </a>
                    </div>);
    }
    return (
        <div>
            <a onClick={this._deleteClick.bind(this, this.props.rowData.id)}  title={strings.Remove}>
                <span className="glyphicon glyphicon-remove"></span>
            </a>
        </div>
    );
    }
}

let columnMetadata = [
    {
        columnName: 'code',
        displayName: 'ID',
        cssClassName: 'id-column',
        sortable: true,
        filterable: true,
        order: 1,
    },
    {
        columnName: 'name',
        displayName: 'Название',
        cssClassName: 'id-column',
        sortable: true,
        filterable: true,
        order: 2,
    },
    {
        columnName: 'icons',
        displayName: '',
        customComponent: IconsColumn,
        sortable: false,
        cssClassName: 'icons-column', 
        order: 3,
    },
    {
        columnName: 'id',
        visible: false,
        keyColumn: true,
    }
];

class Addresses extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            addresses: [],
            isDataLoaded: false,
            rowId: 'lastOnPage',
            newAddressOrder: false,
        };

        this._onChecked = this._onChecked.bind(this);
        this._selectedRowChanged = this._selectedRowChanged.bind(this);
        this._addAddressClicked = this._addAddressClicked.bind(this);
        this._reloadData = this._reloadData.bind(this);

        deleteAddress = this.deleteAddress.bind(this);
        cancelIcon = this.cancelIcon.bind(this);
    }

    componentDidMount() {
        this._getData();
    }
    
    _getData(isRefresh, attrCode) {
        $.get(this.props.getAddressesUrl)
            .done(data => {
                let page;
                if (attrCode) {
                    const newAttrIdx = data.findIndex(a => a.code === attrCode);
                    page = Math.trunc(newAttrIdx / rowsCount) + 1;
                }
                
                this.setState({ addresses: data, 
                                isDataLoaded: true, 
                                isRefresh,
                                attrId: attrCode ? data.find(a => a.code === attrCode).id : undefined,
                                currentPage: page ? page : 'first',
                              });
            })
            .fail(x => showError(strings.Error500));
    }

    _reloadData(isRefresh, attrCode) {
        this.refs.grid.showLoader();
        this._getData(isRefresh, attrCode);
    }

    _onChecked(e) {
        this.setState({ [e.target.id]: e.target.checked });
        this._reloadData(true, e.target.id, e.target.checked);
    }

    deleteAddress(id) {
        if (confirm(strings.RemoveRecordConfirm)) {
            $.post(this.props.deleteAddressUrl, { id })
                .done(x => this._deleteAddress(id))
                .fail(x => showError(strings.Error500));
        }
    }

    _deleteAddress(id) {
        const addresses = this.state.addresses.slice();
        addresses.splice(addresses.findIndex(o => o.id === id), 1);
        this.setState({ addresses, newAddressOrder: false });
    }

    cancelIcon() {
        const addresses = this.state.addresses.slice(0);
        addresses.pop();
        this.setState({ addresses, rowId: 'lastOnPage', newAddressOrder: false });
    }

    _selectedRowChanged(selectedRow) {
        if (selectedRow != undefined && selectedRow.code) {      
            $.get(this.props.getAddressUrl, { id: selectedRow.id })
            .done(data => {
                this.setState({ address: data });
            })
            .fail(x => showError(strings.Error500));
        } else {
            var emptyAddress = { 
                account: '',
                bankNameA: '',
                bankNameR: '',
                bic: '',
                code: '',
                correspondentAccount: '',
                id: '',
                inn: '',
                kpp: '',
                nameA: '',
                nameR: '',
                okato: '',
                personalAccount: '',
                props1: '',
                props6: '',
                rounding: '',
                translations: [{
                    bankAccount: '',
                    bankAccountId: '',
                    bankName: '',
                    id: '',
                    language: '',
                    languageId: '',
                    name: ''
                }]
            };
            this.setState({ address: emptyAddress })
        }
    }

    _getToolbar() {
        return (
                <div className="form-inline">
                    <button type="button" className="btn btn-primary add-btn" onClick={this._addAddressClicked} disabled={this.state.newAddressOrder}>{strings.Add}
                        <span className="glyphicon glyphicon-plus icon-on-button" title={strings.Add} ></span>
                    </button>
                </div>
        );
    }

    _addAddressClicked() {
        const addresses = this.state.addresses.slice(0);
        addresses.push({
            code: '',
        });
        this.setState({ addresses, currentPage: 'last', newAddressOrder: true, rowId:  addresses.length - 1  });
    }

    _getGrid() {
        if (this.state.isDataLoaded) {
            return <Grid ref="grid"
                            tableClassName="grid table"
                            results={this.state.addresses}
                            showFilter={true}
                            showColumnsFilter={false}
                            showPageSizeSelector={false}
                            resultsPerPage={rowsCount}
                            columnMetadata={columnMetadata}
                            selectable
                            defaultSelectedRow={this.state.attrId !== undefined ? this.state.attrId/*.toString()*/ : 'lastOnPage'}
                            selectedRowChanged={this._selectedRowChanged}
                            currentPage={this.state.currentPage}
                            isRefresh={this.state.isRefresh}
                   />;
        }
        return <Loader cssClassName="page-loader"/>;
    }

    _getDetail() {
        if (this.state.address) {
            return <AddressDetails
                        address={this.state.address}
                        reloadData={this._reloadData}
                        {...this.props}
                    />;
        }
        return <Loader cssClassName="page-loader detail"/>;
    }

    render() {
        return (
            <form className="addresses">
                <div className="col-lg-6">
                    {this._getToolbar()}    
                    {this._getGrid()}
                </div>
                <div className="col-lg-6">
                    {this._getDetail()}
                </div>
            </form>
        );
    }
}

export function init(options) {
    ReactDom.render(<Addresses {...options} />, document.getElementById('container'));
}

const languages = [companySettings.defaultLanguage, ...companySettings.alternativeLanguages];

class AddressDetails extends React.PureComponent {
    constructor(props) {    
        super(props);
        this.initState(props);
        this.handleChange = this.handleChange.bind(this);
        this._saveClicked = this._saveClicked.bind(this);
        this._cancelClicked = this._cancelClicked.bind(this);
    }

    componentWillReceiveProps(props) {
        this.initState(props);
    }

    initState(props) {
        this.state = {
            names: []
        };
        Object.keys(props.address).forEach(p => this.state[p] = props.address[p]);
        languages.forEach(l => {
            const name = props.address.translations.find(n => n.languageId === l);
            if (name != undefined) {
                this.state[`name${l}`] = name.name;
            } else {
                this.state[`name${l}`] = '';
            }
        });
    }
    
    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    _getAddressDetails() {
        return (
            <div className="tab-pane general-tab active" id="tab1">
                {this._getCode()}
                {this._getNames()}
                {this._getFields()}
            </div>
        );
    }

    _getCode() {
        const propName = 'code';
        return (
            <div className="form-group" key={propName}>
                <label htmlFor={propName}>ID</label>
                <input className="form-control" id={propName} value={this.state[propName]} onChange={this.handleChange}/>
            </div>
        );
    }

    _getNames() {
		const names = [];
		this.state.names = [];
		languages.forEach(language => {
			const propName = 'name'+language;
			names.push(
            <div className="form-group" key={language}>
                <label>{strings.Name} ({language})</label>
                <input className="form-control" id={propName} value={this.state[propName]} onChange={this.handleChange}/>
            </div>);
        this.state.names.push({'languageCode': language, 'text': this.state[propName]});
        });
        return names;
    }

    _getFields() {
        const fields = [];
        let propNames = ['props1', 'inn', 'okato', 'personalAccount', 'kpp', 'props6', 'bic', 'account', 'correspondentAccount', 'rounding'];
        propNames.forEach(propName => {console.log('values ', propName, this.state[propName]);
            if (this.state[propName] == null) this.state[propName] = '';
            fields.push(
            <div className="form-group"  key={propName}> 
                <label htmlFor={propName}>{strings[this.capitalizeFirstLetter(propName)]}</label>
                <input className="form-control" id={propName} value={this.state[propName]} onChange={this.handleChange}/>
            </div>);
        });
        return fields;
	}

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    _getButtons() {
        return (
        <div className="buttons">
            <button type="button" className="btn btn-primary cancel-btn" onClick={this._cancelClicked}>{strings.Cancel}</button>
            <button type="button" className="btn btn-primary save-btn" onClick={this._saveClicked}>{strings.Save}</button>
        </div>);
    }

    _cancelClicked() {
    }

    _saveClicked() {
        let chosenAddress = new Object({
            id:                   this.state.id,
            code:                 this.state.code,
            bankNameR:            this.state.bankNameR,
            bankNameA:            this.state.bankNameA,
            props1:               this.state.props1,
            inn:                  this.state.inn,
            okato:                this.state.okato,
            personalAccount:      this.state.personalAccount,
            kpp:                  this.state.kpp,
            props6:               this.state.props6,
            bic:                  this.state.bic,
            account:              this.state.account,
            correspondentAccount: this.state.correspondentAccount,
            rounding:             this.state.rounding,
        });

        $.post(this.props.addAddressUrl, { address: chosenAddress, names: this.state.names })
            .done(x => this.props.reloadData(true, chosenAddress.code))
            .fail(xhr => showError(strings.Error500));
    }

    render() {
        return (
            <div className="operation-details address-details">
                <div className="tab-content">
                     {this._getAddressDetails()}
                     {this._getButtons()}
                </div>
            </div>
        );
    }
}
