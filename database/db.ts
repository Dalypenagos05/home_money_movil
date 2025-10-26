import * as SQLite from 'expo-sqlite';

// Open or create database
export const db = SQLite.openDatabaseSync('homemoney.db');

// Initialize database tables based on your existing structure
export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS usuario (
        id_usu INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        telefono TEXT NOT NULL,
        clave TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categoria (
        id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        id_usu INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE
      );

      -- Monto table (transactions)
      CREATE TABLE IF NOT EXISTS monto (
        id_monto INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL NOT NULL,
        descripcion TEXT,
        id_categoria INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        id_usu INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE,
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE
      );

      -- Blog table
      CREATE TABLE IF NOT EXISTS blog (
        id_blog INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        id_usu INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE
      );

      -- Respuesta table (blog comments)
      CREATE TABLE IF NOT EXISTS respuesta (
        id_respuesta INTEGER PRIMARY KEY AUTOINCREMENT,
        texto TEXT,
        id_blog INTEGER NOT NULL,
        id_usu INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_blog) REFERENCES blog(id_blog) ON DELETE CASCADE,
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE
      );

      -- Contacto table
      CREATE TABLE IF NOT EXISTS contacto (
        id_contacto INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        apellido TEXT,
        correo TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_monto_usuario ON monto(id_usu);
      CREATE INDEX IF NOT EXISTS idx_monto_categoria ON monto(id_categoria);
      CREATE INDEX IF NOT EXISTS idx_monto_fecha ON monto(fecha);
      CREATE INDEX IF NOT EXISTS idx_categoria_usuario ON categoria(id_usu);
      CREATE INDEX IF NOT EXISTS idx_blog_usuario ON blog(id_usu);
    `);

    // Add icon and color columns if they don't exist
    try {
      db.execSync(`ALTER TABLE categoria ADD COLUMN icono TEXT;`);
      db.execSync(`ALTER TABLE categoria ADD COLUMN color TEXT;`);
    } catch (e) {
      // ignore if columns already exist
    }
    
    // Add foto_uri column if it doesn't exist
    try {
      db.execSync(`ALTER TABLE usuario ADD COLUMN foto_uri TEXT;`);
    } catch (e) {
      // ignore if it already exists
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// ============ USUARIO FUNCTIONS ============

export const createUser = (user: {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  clave: string;
}) => {
  try {
    const result = db.runSync(
      `INSERT INTO usuario (nombre, apellido, correo, telefono, clave) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.nombre, user.apellido, user.correo, user.telefono, user.clave]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = (correo: string) => {
  try {
    const result = db.getFirstSync(
      'SELECT * FROM usuario WHERE correo = ?',
      [correo]
    );
    return result;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const updateUser = (id_usu: number, updates: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  foto_uri?: string | null; // allow setting or clearing the photo
}) => {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.nombre !== undefined) { fields.push('nombre = ?'); values.push(updates.nombre); }
    if (updates.apellido !== undefined) { fields.push('apellido = ?'); values.push(updates.apellido); }
    if (updates.telefono !== undefined) { fields.push('telefono = ?'); values.push(updates.telefono); }
    if (updates.correo !== undefined) { fields.push('correo = ?'); values.push(updates.correo.toLowerCase().trim()); }
    if (updates.foto_uri !== undefined) { fields.push('foto_uri = ?'); values.push(updates.foto_uri); }

    if (fields.length === 0) return;

    values.push(id_usu);
    db.runSync(`UPDATE usuario SET ${fields.join(', ')} WHERE id_usu = ?`, values);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ============ CATEGORIA FUNCTIONS ============

export const createCategoria = (categoria: {
  nombre: string;
  id_usu: number;
  icono?: string;
  color?: string;
}) => {
  try {
    const result = db.runSync(
      `INSERT INTO categoria (nombre, id_usu, icono, color) VALUES (?, ?, ?, ?)`,
      [categoria.nombre, categoria.id_usu, categoria.icono || null, categoria.color || null]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating categoria:', error);
    throw error;
  }
};

export const getCategoriasByUser = (id_usu: number) => {
  try {
    const result = db.getAllSync(
      'SELECT * FROM categoria WHERE id_usu = ? ORDER BY nombre',
      [id_usu]
    );
    return result;
  } catch (error) {
    console.error('Error getting categorias:', error);
    return [];
  }
};

export const updateCategoria = (id_categoria: number, updates: {
  nombre?: string;
  icono?: string;
  color?: string;
}) => {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.nombre !== undefined) { fields.push('nombre = ?'); values.push(updates.nombre); }
    if (updates.icono !== undefined) { fields.push('icono = ?'); values.push(updates.icono); }
    if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }

    if (fields.length === 0) return;

    values.push(id_categoria);
    db.runSync(`UPDATE categoria SET ${fields.join(', ')} WHERE id_categoria = ?`, values);
  } catch (error) {
    console.error('Error updating categoria:', error);
    throw error;
  }
};

export const deleteCategoria = (id_categoria: number) => {
  try {
    db.runSync('DELETE FROM categoria WHERE id_categoria = ?', [id_categoria]);
  } catch (error) {
    console.error('Error deleting categoria:', error);
    throw error;
  }
};

// ============ MONTO (TRANSACTION) FUNCTIONS ============

export const createMonto = (monto: {
  valor: number;
  descripcion?: string;
  id_categoria: number;
  fecha: string;
  id_usu: number;
}) => {
  try {
    const result = db.runSync(
      `INSERT INTO monto (valor, descripcion, id_categoria, fecha, id_usu) 
       VALUES (?, ?, ?, ?, ?)`,
      [monto.valor, monto.descripcion || '', monto.id_categoria, monto.fecha, monto.id_usu]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating monto:', error);
    throw error;
  }
};

export const getMontosByUser = (id_usu: number) => {
  try {
    const result = db.getAllSync(
      `SELECT m.*, c.nombre as categoria_nombre 
       FROM monto m 
       JOIN categoria c ON m.id_categoria = c.id_categoria 
       WHERE m.id_usu = ? 
       ORDER BY m.fecha DESC`,
      [id_usu]
    );
    return result;
  } catch (error) {
    console.error('Error getting montos:', error);
    return [];
  }
};

export const getMontosByDateRange = (id_usu: number, startDate: string, endDate: string) => {
  try {
    const result = db.getAllSync(
      `SELECT m.*, c.nombre as categoria_nombre 
       FROM monto m 
       JOIN categoria c ON m.id_categoria = c.id_categoria 
       WHERE m.id_usu = ? AND m.fecha BETWEEN ? AND ?
       ORDER BY m.fecha DESC`,
      [id_usu, startDate, endDate]
    );
    return result;
  } catch (error) {
    console.error('Error getting montos by date:', error);
    return [];
  }
};

export const getTotalByType = (id_usu: number) => {
  try {
    const result = db.getFirstSync(
      `SELECT 
        SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END) as total_gastos,
        SUM(valor) as balance
       FROM monto 
       WHERE id_usu = ?`,
      [id_usu]
    );
    return result;
  } catch (error) {
    console.error('Error getting totals:', error);
    return { total_ingresos: 0, total_gastos: 0, balance: 0 };
  }
};

export const updateMonto = (id_monto: number, monto: {
  valor?: number;
  descripcion?: string;
  id_categoria?: number;
  fecha?: string;
}) => {
  try {
    const fields = [];
    const values = [];
    
    if (monto.valor !== undefined) {
      fields.push('valor = ?');
      values.push(monto.valor);
    }
    if (monto.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(monto.descripcion);
    }
    if (monto.id_categoria !== undefined) {
      fields.push('id_categoria = ?');
      values.push(monto.id_categoria);
    }
    if (monto.fecha !== undefined) {
      fields.push('fecha = ?');
      values.push(monto.fecha);
    }
    
    values.push(id_monto);
    
    db.runSync(
      `UPDATE monto SET ${fields.join(', ')} WHERE id_monto = ?`,
      values
    );
  } catch (error) {
    console.error('Error updating monto:', error);
    throw error;
  }
};

export const deleteMonto = (id_monto: number) => {
  try {
    db.runSync('DELETE FROM monto WHERE id_monto = ?', [id_monto]);
  } catch (error) {
    console.error('Error deleting monto:', error);
    throw error;
  }
};

// ============ BLOG FUNCTIONS ============

export const createBlog = (blog: {
  titulo: string;
  descripcion?: string;
  id_usu: number;
}) => {
  try {
    const result = db.runSync(
      `INSERT INTO blog (titulo, descripcion, id_usu) VALUES (?, ?, ?)`,
      [blog.titulo, blog.descripcion || '', blog.id_usu]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

export const getAllBlogs = () => {
  try {
    const result = db.getAllSync(
      `SELECT b.*, u.nombre, u.apellido 
       FROM blog b 
       JOIN usuario u ON b.id_usu = u.id_usu 
       ORDER BY b.created_at DESC`
    );
    return result;
  } catch (error) {
    console.error('Error getting blogs:', error);
    return [];
  }
};

export const getBlogsByUser = (id_usu: number) => {
  try {
    const result = db.getAllSync(
      'SELECT * FROM blog WHERE id_usu = ? ORDER BY created_at DESC',
      [id_usu]
    );
    return result;
  } catch (error) {
    console.error('Error getting user blogs:', error);
    return [];
  }
};

export const deleteBlog = (id_blog: number) => {
  try {
    db.runSync('DELETE FROM blog WHERE id_blog = ?', [id_blog]);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// ============ RESPUESTA (COMMENT) FUNCTIONS ============

export const createRespuesta = (respuesta: {
  texto: string;
  id_blog: number;
  id_usu: number;
}) => {
  try {
    const result = db.runSync(
      `INSERT INTO respuesta (texto, id_blog, id_usu) VALUES (?, ?, ?)`,
      [respuesta.texto, respuesta.id_blog, respuesta.id_usu]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating respuesta:', error);
    throw error;
  }
};

export const getRespuestasByBlog = (id_blog: number) => {
  try {
    const result = db.getAllSync(
      `SELECT r.*, u.nombre, u.apellido 
       FROM respuesta r 
       JOIN usuario u ON r.id_usu = u.id_usu 
       WHERE r.id_blog = ? 
       ORDER BY r.created_at ASC`,
      [id_blog]
    );
    return result;
  } catch (error) {
    console.error('Error getting respuestas:', error);
    return [];
  }
};

// ============ CONTACTO FUNCTIONS ============

export const createContacto = (contacto: {
  nombre: string;
  apellido: string;
  correo: string;
}) => {
  try {
    const result = db.runSync(
      `INSERT INTO contacto (nombre, apellido, correo) VALUES (?, ?, ?)`,
      [contacto.nombre, contacto.apellido, contacto.correo]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating contacto:', error);
    throw error;
  }
};