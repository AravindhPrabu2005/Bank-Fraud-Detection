import React from 'react'

const Indexpage = () => {
  const userId = localStorage.getItem('userId');
  return (
    <>
    <h1>Indexpage</h1>
    <p>{userId}</p>
    </>
  )
}

export default Indexpage