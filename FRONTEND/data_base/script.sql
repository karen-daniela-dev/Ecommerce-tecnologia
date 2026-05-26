
CREATE TABLE usuarios (
    id_usuario  SERIAL PRIMARY KEY,
    nombre      VARCHAR(150)        NOT NULL,
    cedula      VARCHAR(20)         UNIQUE NOT NULL,
    correo      VARCHAR(255)        UNIQUE NOT NULL,
    telefono    VARCHAR(20),
    contrasena  VARCHAR(255)        NOT NULL,  -- Almacenar hash, nunca texto plano
    es_admin    BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);


-- TABLA: categorias

CREATE TABLE categorias (
    id_categoria    SERIAL PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL UNIQUE
);


-- TABLA: usos
CREATE TABLE usos (
    id_uso  SERIAL PRIMARY KEY,
    nombre  VARCHAR(100)    NOT NULL UNIQUE
);

-- TABLA: marcas
CREATE TABLE marcas (
    id_marca    SERIAL PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL UNIQUE
);

-- TABLA: productos
--  user_id representa el cliente/admin
CREATE TABLE productos (
    id_producto     SERIAL PRIMARY KEY,
    nombre          VARCHAR(255)        NOT NULL,
    stock           INTEGER             NOT NULL DEFAULT 0 CHECK (stock >= 0),
    precio          NUMERIC(10, 2)      NOT NULL CHECK (precio >= 0),
    url_imagen      TEXT,
    descripcion     TEXT,
    categoria_id    INTEGER             NOT NULL,
    uso_id          INTEGER             NOT NULL,
    marca_id        INTEGER             NOT NULL,
    user_id         INTEGER             NOT NULL, 
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW(),

    -- Relaciones con productos
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias (id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_productos_uso
        FOREIGN KEY (uso_id) REFERENCES usos (id_uso)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_productos_marca
        FOREIGN KEY (marca_id) REFERENCES marcas (id_marca)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_productos_usuario
        FOREIGN KEY (user_id) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- TABLA: compras
CREATE TABLE compras (
    id_compra   SERIAL PRIMARY KEY,
    fecha       TIMESTAMP       NOT NULL DEFAULT NOW(),
    user_id     INTEGER         NOT NULL,

    CONSTRAINT fk_compras_usuario
        FOREIGN KEY (user_id) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- TABLA: detalle_compra
CREATE TABLE detalle_compra (
    id_detalle      SERIAL PRIMARY KEY,
    cantidad        INTEGER             NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2)      NOT NULL CHECK (precio_unitario >= 0),
    compra_id       INTEGER             NOT NULL,
    producto_id     INTEGER             NOT NULL,

    CONSTRAINT fk_detalle_compra
        FOREIGN KEY (compra_id) REFERENCES compras (id_compra)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- iNDICES (mejoran el rendimiento de búsquedas por FK)
CREATE INDEX idx_productos_categoria    ON productos (categoria_id);
CREATE INDEX idx_productos_uso          ON productos (uso_id);
CREATE INDEX idx_productos_marca        ON productos (marca_id);
CREATE INDEX idx_productos_usuario      ON productos (user_id);
CREATE INDEX idx_compras_usuario        ON compras (user_id);
CREATE INDEX idx_detalle_compra         ON detalle_compra (compra_id);
CREATE INDEX idx_detalle_producto       ON detalle_compra (producto_id);


-- INGRESO DE DATOS A CADA TABLA


INSERT INTO categorias (nombre) VALUES
    ('Laptops'),
    ('Mouses'),
    ('Smartwatches'),
    ('Audio'),
    ('Teclados'),
    ('Tarjetas Gráficas'),
    ('Accesorios'),
   
   

-- 2. USOS
INSERT INTO usos (nombre) VALUES
    ('Trabajo'),
    ('Estudio'),
    ('Gamer'),
    ('General'),
    
 
 
-- 3. MARCAS

INSERT INTO marcas (nombre) VALUES
    ('Acer'),
    ('Apple'),
    ('Dell'),
    ('HP'),
    ('Lenovo'),
    ('Otras'),
    ('Samsung'),
    ('MSI'),
    ('Asus');
 

-- 4. USUARIOS
-- 2 administradores + 8 clientes
-- NOTA: contraseñas representadas como hash bcrypt simulado

INSERT INTO usuarios (nombre, cedula, correo, telefono, contrasena, es_admin, created_at) VALUES
    ('Admin Principal',    '1000000001', 'admin@tienda.com',         '3001000001', '$2b$12$hashed_admin_001', TRUE,  '2024-01-10 08:00:00'),
    ('Admin Soporte',      '1000000002', 'soporte@tienda.com',       '3001000002', '$2b$12$hashed_admin_002', TRUE,  '2024-01-10 08:30:00'),
    ('Carlos Pérez',       '1090123456', 'carlos.perez@gmail.com',   '3102345678', '$2b$12$hashed_user_003',  FALSE, '2024-02-01 10:15:00'),
    ('María Rodríguez',    '1075432109', 'maria.rodriguez@gmail.com','3157654321', '$2b$12$hashed_user_004',  FALSE, '2024-02-15 11:00:00'),
    ('Juan Gómez',         '1060987654', 'juan.gomez@hotmail.com',   '3173456789', '$2b$12$hashed_user_005',  FALSE, '2024-03-01 09:30:00'),
    ('Ana Torres',         '1055678901', 'ana.torres@yahoo.com',     '3189012345', '$2b$12$hashed_user_006',  FALSE, '2024-03-20 14:00:00'),
    ('Luis Martínez',      '1044321098', 'luis.martinez@gmail.com',  '3201234567', '$2b$12$hashed_user_007',  FALSE, '2024-04-05 16:45:00'),
    ('Sofía Castro',       '1033210987', 'sofia.castro@outlook.com', '3212345678', '$2b$12$hashed_user_008',  FALSE, '2024-04-18 13:20:00'),
    ('Diego Herrera',      '1022109876', 'diego.herrera@gmail.com',  '3223456789', '$2b$12$hashed_user_009',  FALSE, '2024-05-02 10:00:00'),
    ('Valentina López',    '1011098765', 'valentina.lopez@gmail.com','3234567890', '$2b$12$hashed_user_010',  FALSE, '2024-05-15 08:50:00');
 

 

-- 5. PRODUCTOS
--  productos variados, referenciando las FK correctas

INSERT INTO productos (nombre, stock, precio, url_imagen, descripcion, categoria_id, uso_id, marca_id, user_id, created_at) VALUES
 
    -- 1. Laptop Acer Aspire 5 — Laptops / Estudio / Acer
    (
        'Acer Aspire 5 A515-56',
        15,
        2899000.00,
        'https://tienda.com/img/acer-aspire5.jpg',
        'Laptop 15.6" Full HD, Intel Core i5-1135G7, 8GB RAM DDR4, SSD 512GB, Windows 11 Home. Ideal para estudio y trabajo diario.',
        1, 2, 1, 3,
        '2024-02-05 10:00:00'
    ),
 
    -- 2. Mouse Logitech MX Master 3 — Mouses / Trabajo / Otras (Logitech está como "Otras" en las marcas definidas; usamos id 8=Logitech)
    (
        'Logitech MX Master 3S',
        40,
        459000.00,
        'https://tienda.com/img/mx-master3s.jpg',
        'Mouse inalámbrico profesional, sensor 8000 DPI, scroll MagSpeed, conexión Bluetooth y USB Unifying. Batería recargable.',
        2, 1, 8, 4,
        '2024-02-20 11:30:00'
    ),
 
    -- 3. Apple Watch Series 9 — Smartwatches / General / Apple
    (
        'Apple Watch Series 9 GPS 45mm',
        20,
        1899000.00,
        'https://tienda.com/img/apple-watch-s9.jpg',
        'Smartwatch con chip S9, pantalla Always-On Retina, GPS integrado, monitoreo de salud avanzado, resistente al agua 50m.',
        3, 4, 2, 5,
        '2024-03-01 09:00:00'
    ),
 
    -- 4. Auriculares Sony WH-1000XM5 — Audio / Trabajo / Otras
    (
        'Sony WH-1000XM5 Cancelación de Ruido',
        25,
        1299000.00,
        'https://tienda.com/img/sony-wh1000xm5.jpg',
        'Auriculares over-ear con cancelación de ruido líder de la industria, 30h de batería, llamadas manos libres con 8 micrófonos, plegable.',
        4, 1, 6, 6,
        '2024-03-10 14:00:00'
    ),
 
    -- 5. Teclado Mecánico Razer BlackWidow V3 — Teclados / Gamer / Razer
    (
        'Razer BlackWidow V3 Tenkeyless',
        30,
        649000.00,
        'https://tienda.com/img/razer-blackwidow-v3.jpg',
        'Teclado mecánico gaming TKL, switches Razer Green, iluminación RGB Chroma, anti-ghosting total, construcción aluminio.',
        5, 3, 4, 7,
        '2024-03-25 16:00:00'
    ),
 
    -- 6. Tarjeta Gráfica ASUS RTX 4070 — Tarjetas Gráficas / Gamer / Asus
    (
        'ASUS ROG Strix GeForce RTX 4070 OC 12GB',
        8,
        3499000.00,
        'https://tienda.com/img/asus-rtx4070.jpg',
        'GPU NVIDIA RTX 4070 con 12GB GDDR6X, DLSS 3, ray tracing, triple ventilador Axial-tech, OC Edition para máximo rendimiento gaming.',
        6, 3, 1, 8,
        '2024-04-01 10:00:00'
    ),
 
    -- 7. Hub USB-C Dell — Accesorios / Trabajo / Dell
    (
        'Dell WD19S Docking Station 130W',
        18,
        849000.00,
        'https://tienda.com/img/dell-wd19s.jpg',
        'Estación de acoplamiento USB-C con carga 130W, HDMI, DisplayPort, USB-A x4, USB-C, RJ45 Gigabit Ethernet. Compatible con laptops Dell y otras marcas.',
        7, 1, 3, 9,
        '2024-04-08 09:30:00'
    ),
 
  
 
   
 
 
    -- 10. Laptop Lenovo ThinkPad — Laptops / Trabajo / Lenovo
    (
        'Lenovo ThinkPad E14 Gen 4',
        12,
        3299000.00,
        'https://tienda.com/img/lenovo-thinkpad-e14.jpg',
        'Laptop empresarial 14" FHD IPS, AMD Ryzen 5 5625U, 16GB RAM, SSD 512GB, Windows 11 Pro, teclado retroiluminado, lector de huellas.',
        1, 1, 5, 4,
        '2024-05-01 08:00:00'
    );
 

 
 
-- 6. COMPRAS
-- 10 compras distribuidas entre los clientes (user_id 3-10)
INSERT INTO compras (fecha, user_id) VALUES
    ('2024-03-05 10:25:00', 3),   -- compra 1: Carlos
    ('2024-03-12 14:10:00', 4),   -- compra 2: María
    ('2024-03-20 09:45:00', 5),   -- compra 3: Juan
    ('2024-04-02 16:30:00', 6),   -- compra 4: Ana
    ('2024-04-10 11:00:00', 7),   -- compra 5: Luis
    ('2024-04-18 13:15:00', 8),   -- compra 6: Sofía
    ('2024-04-25 08:50:00', 9),   -- compra 7: Diego
    ('2024-05-03 15:40:00', 10),  -- compra 8: Valentina
    ('2024-05-10 10:05:00', 3),   -- compra 9: Carlos (segunda compra)
    ('2024-05-16 17:20:00', 5);   -- compra 10: Juan (segunda compra)
 

 
 
-- 7. DETALLE_COMPRA
--  líneas de detalle — distribuidas entre las compras
-- precio_unitario = precio histórico al momento de la compra
INSERT INTO detalle_compra (cantidad, precio_unitario, compra_id, producto_id) VALUES
 
    -- Compra 1 (Carlos): compró Acer Aspire 5 + Samsung SSD
    (1, 2899000.00, 1, 1),   -- detalle 1: Acer Aspire 5
    (2,  399000.00, 1, 9),   -- detalle 2: 2x Samsung SSD
 
   
 
    -- Compra 3 (Juan): compró Razer BlackWidow
    (1,  649000.00, 3, 5),   -- detalle 4: Razer BlackWidow V3
 
    -- Compra 4 (Ana): compró Sony WH-1000XM5 + MX Master 3S
    (1, 1299000.00, 4, 4),   -- detalle 5: Sony WH-1000XM5
    (1,  459000.00, 4, 2),   -- detalle 6: Logitech MX Master 3S
 
    -- Compra 5 (Luis): compró ASUS RTX 4070
    (1, 3499000.00, 5, 6),   -- detalle 7: ASUS RTX 4070
 
    -- Compra 6 (Sofía): compró HP Monitor + Dell Docking
    (1,  679000.00, 6, 8),   -- detalle 8: HP V24i
 
    -- Compra 7 (Diego): compró Dell Docking Station
    (1,  849000.00, 7, 7),   -- detalle 9: Dell WD19S
