import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import l1dsaPlayList from './data/l1dsa.json';

function App() {

  const listItems = l1dsaPlayList.map(v => <tr key={v.watch_url}><td><input type="checkbox" /></td><td><img width="80" height="45" src={v.thumbnail_url} /></td><td><a target="_blank" href={v.watch_url}>{v.title}</a></td></tr>);

  return (
    <main>
    <div className="container marketing">
    <h1>Data Structures and Algorithms</h1>
    Following lists level 1 problem solutions.
    <table className="table table-bordered">
        {listItems}
    </table>
    </div>
    </main>

  )
}

export default App
