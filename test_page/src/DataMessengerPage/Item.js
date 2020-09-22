import React from 'react'

export class Item extends React.Component {
  render() {
    return (
      <li
        style={{
          margin: '0 auto',
          width: '200px',
          listStyleType: 'none',
          padding: 0,
          cursor: 'pointer',
          border: '1px solid lightgray',
          borderRadius: '3px',
          paddingRight: '5px',
          marginBottom: '3px',
        }}
        {...this.props}
      >
        {this.props.children}
      </li>
    )
  }
}
