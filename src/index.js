import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Component } from 'react-simplified';
import { NavLink, HashRouter, Route } from 'react-router-dom';
import { pool } from './mysql-pool';

class Menu extends Component {
  render() {
    return (
      <div>
        <NavLink exact to="/" activeStyle={{ color: 'darkblue' }}>
          StudAdm
        </NavLink>{' '}
        <NavLink to="/students" activeStyle={{ color: 'darkblue' }}>
          Students
        </NavLink>{' '}
        <NavLink to="/studieprogram" activeStyle={{ color: 'darkblue' }}>
          Studieprogram
        </NavLink>
      </div>
    );
  }
}

class Home extends Component {
  render() {
    return <div>Welcome to StudAdm</div>;
  }
}

class StudentList extends Component {
  students = [];

  render() {
    return (
      <ul>
        {this.students.map((student) => (
          <li key={student.student_id}>
            <NavLink to={'/students/' + student.student_id}>{student.name}</NavLink>
          </li>
        ))}
      </ul>
    );
  }

  mounted() {
    pool.query('SELECT student_id, name FROM studenter', (error, results) => {
      if (error) return console.error(error); // If error, show error in console (in red text) and return

      this.students = results;
    });
  }
}

class StudentDetails extends Component {
  student = null;

  mounted() {
    pool.query(
      'SELECT studenter.name, studenter.email, studieprogram.studie FROM studenter INNER JOIN studieprogram ON studenter.studie_id = studieprogram.studie_id WHERE studenter.student_id=?',
      [this.props.match.params.id],
      (error, results) => {
        if (error) return console.error(error); // If error, show error in console (in red text) and return

        this.student = results[0];
      },
    );
  }
  render() {
    if (!this.student) return null;

    return (
      <ul>
        <li>Name: {this.student.name}</li>
        <li>Email: {this.student.email}</li>
        <li>Studieprogram: {this.student.studie}</li>
      </ul>
    );
  }
}

class Studieprogram extends Component {
  studie = [];

  mounted() {
    pool.query('SELECT studie_id, studie FROM studieprogram', (error, results) => {
      if (error) return console.error(error);

      this.studie = results;
    });
  }

  render() {
    return (
      <ul>
        {this.studie.map((studie) => (
          <li key={studie.studie_id}>
            <NavLink to={`/studie/${studie.studie_id}`}>{studie.studie}</NavLink>
          </li>
        ))}
      </ul>
    );
  }
}

class Studie extends Component {
  state = {
    studie: null,
    students: [],
  };

  mounted() {
    pool.query(
      'SELECT studieprogram.studie_id, studieprogram.studie, studieprogram.fagkode, studenter.name FROM studieprogram INNER JOIN studenter ON studieprogram.studie_id = studenter.studie_id WHERE studieprogram.studie_id = ?',
      [this.props.match.params.id],
      (error, results) => {
        if (error) return console.error(error);

        const studieData = results[0];
        const students = results.map((result) => result.name);

        this.setState({ studie: studieData, students: students });
      },
    );
  }

  render() {
    const { studie, students } = this.state;

    if (!studie) return null;

    return (
      <div>
        <ul>
          <li>Fagkode: {studie.fagkode}</li>
          <li>Studieprogram: {studie.studie}</li>
          <li>Studenter:</li>
          <ul>
            {students.map((student, index) => (
              <li key={index}>{student}</li>
            ))}
          </ul>
        </ul>
      </div>
    );
  }
}

export default Studie;

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <div>
      <Menu />
      <Route exact path="/" component={Home} />
      <Route exact path="/students" component={StudentList} />
      <Route exact path="/students/:id" component={StudentDetails} />
      <Route exact path="/studieprogram" component={Studieprogram} />
      <Route exact path="/studie/:id" component={Studie} />
    </div>
  </HashRouter>,
);
