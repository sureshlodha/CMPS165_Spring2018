import * as utils from './index'
import React, {Component} from 'react'
import {render} from 'react-dom';
import * as ReactDOM from "react-dom";
import ReactModal from "react-modal";
import {display_country, country_contents, contents} from "./variables";
import {updateChart} from "./line_chart";
import Checkbox from "react-bootstrap/es/Checkbox";
import {FormGroup} from "react-bootstrap";

const button_style = {
    visibility: 'hidden',
    transform: 'translate(100px, 680px)'
};


const column = {
    float: 'left',
    width: '33%',
    padding: '20px'
};


export function create_modal() {
    const props = {countries: utils.water_stress};
    ReactDOM.render(<Model {...props} />, document.getElementById('root'));
}


class Model extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleOpenModal() {
        this.setState({showModal: true});
    }

    handleCloseModal() {
        this.setState({showModal: false});
        updateChart(false)
    }


    render() {
        return (
            <div id={"react-code"}>
                <button id="add_button" style={button_style} onClick={this.handleOpenModal}>Add countries</button>
                <ReactModal
                    className="Modal"
                    isOpen={this.state.showModal}
                    contentLabel="Minimal Modal Example"
                    ariaHideApp={false}
                >
                    <a className="close-classic" onClick={this.handleCloseModal}/>

                    <FilteredList/>

                </ReactModal>
            </div>
        )
    }
}


class FilteredList extends React.Component {

    constructor(props) {
        super(props);
        let items = {};
        Object.keys(display_country).forEach(function (key) {
            items[key] = display_country[key].display;
        });
        this.state = {
            initialItems: items,
            items: items
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.filterList = this.filterList.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleChange = this.handleChange.bind(this);
        self = this;
    }

    handleOpenModal() {
        this.setState({showModal: true});
    }

    filterList(event) {
        let initialItems = this.state.initialItems;
        let updated = {};
        Object.keys(initialItems).filter(function (item) {
            let res = item.toLowerCase().search(event.target.value.toLowerCase()) !== -1;
            if (res || initialItems[item]) {
                updated[item] = initialItems[item];
            }
        });
        this.setState({items: updated});
    }

    componentWillMount() {
        this.setState({items: this.state.items})
    }

    handleChange(event) {
        display_country[event.target.value].display = !!event.target.checked;
        let dict = this.state.items;
        dict[event.target.value] = !!event.target.checked;
        this.setState({
            items: dict,
            initialItems: dict
        });

    }

    handleChangeContent(event) {
        let countries = country_contents[event.target.value].values;

        country_contents[event.target.value].display = !!event.target.checked;
        countries.forEach(function (val) {
            display_country[val].display = !!event.target.checked;
        });
        // display_country[event.target.value].display = !!event.target.checked;
        // let dict = this.state.items;
        // dict[event.target.value] = !!event.target.checked;
        // this.setState({
        //     items: dict,
        //     initialItems: dict
        // });

    }

    render() {
        return (
            <div className="filter-list">
                <form>
                    <fieldset className="form-group">
                        <input type="text" className="form-control form-control-lg" placeholder="Search"
                               onChange={this.filterList}/>
                    </fieldset>
                </form>
                <div className={"row"}>
                    <FormGroup style={column}>
                        <label>{"Un-Selected"}</label>
                        {Object.keys(this.state.items).map(function (key) {
                            if (self.state.items[key] === false)
                                return (<label className="container">{key}
                                        <input type="checkbox" value={key} onChange={self.handleChange}/>
                                        <span className="checkmark"/>
                                    </label>
                                )
                        })}
                    </FormGroup>
                    <FormGroup style={column}>
                        <label>{"Selected"}</label>
                        {Object.keys(this.state.items).map(function (key) {
                            if (self.state.items[key] === true)
                                return (<label className="container">{key}
                                        <input type="checkbox" checked="checked" value={key}
                                               onChange={self.handleChange}/>
                                        <span className="checkmark"/>
                                    </label>
                                )

                        })}
                    </FormGroup>

                    <FormGroup style={column}>
                        <label>{"Continents"}</label>
                        {(contents).map(function (key) {
                            return (<label className="container">{key}
                                    <input defaultChecked={country_contents[key].display} type="checkbox" value={key} onChange={self.handleChangeContent}/>
                                    <span className="checkmark"/>
                                </label>
                            )

                        })}
                    </FormGroup>
                </div>
            </div>
        );
    }
}

// defaultChecked={true} value={key} onChange={self.handleChange}>{key}
