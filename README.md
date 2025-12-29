- Este proyecto se usa para enviar principalmente a REWARDS cambios en las bbdd a todas a la vez, aunque se puede usar también para todas las bbdd que tengan esquemas iguales y se quieran aplicar los mismos cambios o comprobaciones.
- Otras de las funciones es comprobar si hay alguna tabla o columna errónea o falta algún dato.

### Funciones a seguir

```
1. Creamos .env con las siguientes variables:
HOST=HOST
PORT=PORT
USER=USER
PASSWORD=PASSWORD

2. (OPCIONAL) Si queremos ejecutar la función "ejecutarScriptMasivo", 
deberemos crear un archivo llamado consulta.sql en la raiz del proyecto 
y añadir ahí la sentencia sql.

3. Elegimos en index.ts la función que queramos usar.

4. Usaremos el siguiente comando para ejecutar
----- npm run start -----
```

### Tener en cuenta
- Usar la versión más moderna de node.js