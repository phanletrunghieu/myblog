import React, { Component } from 'react'

export class Default extends Component {
    render() {
        return (
            <div {...this.props}>
                {this.props.children}
            </div>
        )
    }
}

export default Default
