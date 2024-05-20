const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT,
        profileType TEXT,
        name TEXT
      )
    `);

  db.run(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY,
        roleName TEXT
      )
    `);

  db.run(`
      CREATE TABLE IF NOT EXISTS user_roles (
        userId INTEGER,
        roleId INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (roleId) REFERENCES roles(id)
      )
    `);

  db.run(`
      CREATE TABLE IF NOT EXISTS role_functions (
          id INTEGER PRIMARY KEY,
          roleId INTEGER,
          functionName TEXT,
          icon TEXT,
          FOREIGN KEY (roleId) REFERENCES roles(id)
        )
    `);

    generateRoles(db).then(() => {
      generateFunctionsToRoles(db)
    }) 
});

function getRoles() {
  return ['PROFESSOR', 'ADMINISTRACAO', 'ALUNO'];
}

async function generateRoles(db) {
  const existingRoles = await getExistingRoles();
  const roleInsert = db.prepare('INSERT INTO roles (roleName) VALUES (?)');

  getRoles().forEach((roleName) => {
    if (!existingRoles.includes(roleName)) {
      roleInsert.run(roleName);
    }
  });

  roleInsert.finalize();
}

async function generateFunctionsToRoles() {
  const functionsToAdd = [
    { roleName : 'ADMINISTRACAO', functionName: 'Cadastro de Usuários', icon: 'addusergroup' },
    { roleName : 'ADMINISTRACAO', functionName: 'E-mail', icon: 'mail' },
    { roleName : 'ADMINISTRACAO', functionName: 'Matrículas', icon: 'laptop' },
    { roleName : 'ADMINISTRACAO', functionName: 'Pagamentos', icon: 'bank' },
    { roleName : 'ADMINISTRACAO', functionName: 'Financeiro', icon: 'wallet' },
    { roleName : 'ADMINISTRACAO', functionName: 'Perfil', icon: 'user' },
    { roleName : 'ADMINISTRACAO', functionName: 'Configurações', icon: 'setting' },
    
    { roleName : 'PROFESSOR', functionName: 'Turmas', icon: 'solution1' },
    { roleName : 'PROFESSOR', functionName: 'Cronogama de Aulas', icon: 'calendar' },
    { roleName : 'PROFESSOR', functionName: 'Repositório de Atividades', icon: 'form' },
    { roleName : 'PROFESSOR', functionName: 'E-mail', icon: 'mail' },
    { roleName : 'PROFESSOR', functionName: 'Perfil', icon: 'user' },
    { roleName : 'PROFESSOR', functionName: 'Configurações', icon: 'setting' },

    
    { roleName : 'ALUNO', functionName: 'Horários', icon: 'solution1' },
    { roleName : 'ALUNO', functionName: 'Avaliações físicas', icon: 'edit' },
    { roleName : 'ALUNO', functionName: 'Histórico de treinos', icon: 'book' },
    { roleName : 'ALUNO', functionName: 'E-mail', icon: 'mail' },
    { roleName : 'ALUNO', functionName: 'Perfil', icon: 'user' },
    { roleName : 'ALUNO', functionName: 'Configurações', icon: 'setting' },
  ];

  for (const { roleName, functionName, icon } of functionsToAdd) {
    const existingFunctions = await getFunctionsByRole(roleName);
    const functionExists = existingFunctions.some((func) => func.functionName === functionName);

    if (!functionExists) {
      await addFunctionToRole(roleName, functionName, icon);
    }
  }

  return true;
}


async function getExistingRoles() {
  return new Promise((resolve) => {
    db.all('SELECT roleName FROM roles', (err, rows) => {
      if (err) {
        console.error(err.message);
        resolve([]);
      } else {
        const existingRoles = rows.map(row => row.roleName);
        resolve(existingRoles);
      }
    });
  });
}

async function getRoleId(roleName) {
  return new Promise((resolve) => {
    db.get('SELECT id FROM roles WHERE roleName = ?', [roleName], (err, row) => {
      if (err) {
        console.error(err.message);
        resolve(null);
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
}

async function getFunctionsByRole(roleName) {
  const roleId = await getRoleId(roleName);

  if (!roleId) {
    console.error(`Role ${roleName} not found.`);
    return [];
  }

  return new Promise((resolve) => {
    db.all('SELECT functionName, icon FROM role_functions WHERE roleId = ?', [roleId], (err, rows) => {
      if (err) {
        console.error(err.message);
        resolve([]);
      } else {
        const functions = rows.map((row) => ({
          functionName: row.functionName,
          icon: row.icon,
        }));
        resolve(functions);
      }
    });
  });
}

async function addFunctionToRole(roleName, functionName, icon) {
  const roleId = await getRoleId(roleName);

  if (!roleId) {
    console.error(`Role ${roleName} not found.`);
    return false;
  }

  return new Promise((resolve) => {
    const insertFunction = db.prepare('INSERT INTO role_functions (roleId, functionName, icon) VALUES (?, ?, ?)');
    
    insertFunction.run(roleId, functionName, icon, (err) => {
      if (err) {
        console.error(err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });

    insertFunction.finalize();
  });
}

module.exports = {
  getRoles,
  db,
  getRoleId,
  getFunctionsByRole,
};