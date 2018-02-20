# AWS Mobile React Native Starter App - Serverless Pet Tracker

Bootstrap una aplicación de React Native para AWS.
Inicia mediante Bootstrap una aplicación React Native en AWS. Este
iniciador provee automáticamente una estructura sin servidor con
autenticación, autorización, almacenamiento de imágenes, acceso API y
operaciones en la base de datos. También incluye registro de usuario y
soporte MFA. El caso de uso de muestra es un "Pet Tracker"el cual
después de que un usuario se registra e ingresa, estos pueden subir
fotos de su mascota al sistema además de información como la fecha de
cumpleaños o la raza.

Un blog de apoyo para este repositorio puede conseguirse en el AWS
Mobile Blog:  [Announcing: React Native Starter Project with One-Click
AWS Deployment and Serverless
Infrastructure](https://aws.amazon.com/blogs/mobile/announcing-react-native-starter-project-with-one-click-aws-deployment-and-serverless-infrastructure/).

Este iniciador usa el [AWS Amplify JavaScript
library](https://github.com/aws/aws-amplify)  para darle soporte en la
nube a la aplicación.

### Enlaces rápidos
 - [Getting started](#getstarted)
 - [Using Registration and Login components in your app](#advanced-auth)
 - [Accessing Cloud APIs with REST](#restclient)
 - [Storing images, video and other content in the cloud](#storage)
 - [Modifying Cloud Logic with Lambda for your app](#lambdamodify)

## Vista de arquitectura
![Architecture](media/architecture.png)

Servicios AWS usados:
* Amazon Cognito User Pools
* Amazon Cognito Federated Identities
* Amazon API Gateway
* AWS Lambda
* Amazon DynamoDB
* Amazon S3
* AWS Mobile Hub

## Prerequisitos
- AWS Account
- [Xcode](https://developer.apple.com/xcode/) / [Android
Studio](https://developer.android.com/studio/index.html)
- [Node.js](https://nodejs.org/) with NPM
  - `npm install -g react-native-cli`
  - `npm install -g create-react-native-app`
- [AWS Mobile CLI](https://github.com/aws/awsmobile-cli)
  - `npm install -g awsmobile-cli`
- (_Optional_) [Watchman](https://facebook.github.io/watchman/)
  - On macOS, it is recommended to install it using [Homebrew](https://brew.sh/)
    - `brew install watchman`
- (_Optional_) [AWS CLI](https://aws.amazon.com/cli/)

## Empezando <a name="getstarted"></a>

1. Crea tus recursos backend y descarga el código muestra dentro de la
carpeta my-project
    ```
    $ awsmobile start my-project react-native
    ```


2. Finalmente inicia la aplicación:

    ```
    $ cd my-project
    $ npm i
    $ npm run ios #npm run android
    ```

Listo!

## Guía de Aplicación

1. En un celular o emulador/simulador, abre la aplicación
2. Selecciona la pestaña **SIGN UP** en la parte inferior derecha para
registrar un nuevo usuario. Un email y número de teléfono válidos
serán necesarios para confirmar tu registro.
3. Haz click en **Sign Up** y recibirás un código via SMS. Ingresa
este código y presiona **OK**
3. De la pestaña **Sign in** de la aplicación, ingresa el _Usuario_ y
_Contraseña_ del usuario que acabas de registrar y selecciona **SIGN
IN**
4. Un código se te enviará via SMS. Ingresa ese código y presiona **OK**.

5. Presiona el simbolo de adición (+) y sube una foto. Después de
seleccionar una foto selecciona el **Check mark**
6. Llena algunos detalles como el nombre, fecha de nacimiento, raza y
género de tu mascota. Presiona **Add Pet** para subir la foto. Esto
primero transferirá la foto de una cubeta S3 a la cual sólo el usuario
conectado tiene acceso, luego escribirá el archivo a una tabla
DynamoDB (vía API Gateway y Lambda) que también esta restringida a
cada usuario a la vez.

![Add Pet](media/Nadia1.png)

6. Verás un archivo de tu mascota en la pantalla de inicio.

![My Pets](media/Nadia2.png)

## Usar características de la app

Esta aplicación de inicia usa la librería AWS Amplify para integrarse
con AWS. Los componentes de la librería pueden ser usados en tu
aplicación para añadir capacidades fácilmente para Autenticación,
Almacenamiento y acceso API.
Necesitarás [Create React Native
App](https://github.com/react-community/create-react-native-app) para
las secciones siguientes.
- Crea una nueva aplicación React Native (CRNA) usando `create-react-native-app`
- `cd` en tu nuevo app dir.
- Expulsa tu react native app (en nuestros ejemplos llamada "myapp")
```sh
create-react-native-app <project-directory>
cd <project-directory>
npm run eject # Eject as "React Native"
```
- Descarga el archivo `aws-exports.js` de tu proyecto AWS MobileHub
como se indicó anteriormente en la sección [Getting
started](#getstarted). Colócalo en la raíz de tu nuevo directorio
CRNA.


### Autenticación <a name="advanced-auth"></a>

1. Instala dependencias con`npm install`

2. Instala dependencias adicionales:

```
npm install aws-amplify --save
npm install aws-amplify-react-native --save
```

3. Enlaza los componente nativos lanzando: `react-native link`

4. Abre el archivo `App.js`.

5. Importa el módulo `Auth` de la librería y tus aws-exports aquí
```javascript
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import {awsmobile} from './aws-exports';
```

6. Edita tu componente de aplicación para transformarlo en uno que
soporte `Auth`
```javascript
Amplify.configure(awsmobile);
export default withAuthenticator(class App extends React.Component {
  // ...
});
```
7. Pruébalo!
`npm run ios # or android`

El componente withAuthenticator añade las capacidades Sign Up, Sign In
with MFA y Sign Out a tu aplicación out of the box. Podrías usar este
Higher Order Component, o crea tu propio UI y usar los APIs de
[Amplify](https://github.com/aws/aws-amplify/blob/master/media/authentication_guide.md)
también.


### APIs en la nube y Control de Acceso Backend <a name="restclient"></a>
Para acceder a recursos en tu cuenta AWS que están protegidos vía AWS
[Identity and Access
Management](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
necesitarás presentar tus pedidos usando el proceso de registro [AWS
Signature Version
4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html).
La aplicación de inicio usa el componente API de
[Amplify](https://github.com/aws/aws-amplify) para hacer pedidos al
endpoint de tu API'.

Para hacer llamadas autenticadas a tu API, necesitarás usar el
componente Auth de la librería primero para obtener las Authenticated
AWS Credentials. También puedes hacer pedidos sin autenticar a tu API.
1. Instala dependencias adicionales
`npm install aws-amplify-react-native --save`

2. Importa el archivo `aws-exports.js`
```javascript
importa awsmobile de './aws-exports';
```

3. Importa el componente API de la librería
```javascript
importa Amplify, { API } de 'aws-amplify';
```

4.Configura Amplify //Puedes saltar este paso si Amplify ya fue
configurado en la sección previa en Auth
```javascript
Amplify.configure(awsmobile)
```

5. Edita tu componente de aplicación para usar las funciones API de
Amplify' para hacer llamadas REST para tu API:
```javascript
async function getData() {
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.get(apiName, path, myInit);
}
```

6. Pruébalo!

`npm run ios # or android`

7. Ahora puedes invocar APIs API Gateway desde tu React Native que son
protegidas vía  AWS IAM. Puedes usar otras llamadas REST como muestra
esta guía por [AWS Amplify API
component](https://github.com/aws/aws-amplify/blob/master/media/api_guide.md)

### Almacenando contenido en la nube <a name="storage"></a>
Muchas aplicaciones actualmente son ricas en media como imágenes o
videos. A veces estos archivos son privados a los usuarios. El módulo
AWS Amplify Storage otorga un mecanismo simple para manejar contenido
del usuario en un almacenamiento público o privado.

El componente `Storage` requiere AWS Credentials para llamar el S3. Si
necesitas almacenar datos en carpetas privadas a usuarios, necesitarás
primero que completar la sección Auth. Por favor sigue los pasos de la
sección anterior [Authentication](#advanced-auth).

1. Importa el componente Storage de la librería
```javascript
importa Amplify, { Storage } de 'aws-amplify'
```

2. Importa el archivo `aws-exports.js` si no lo has hecho
```javascript
import awsmobile from './aws-exports';
```

3. Configura Storage usando tu aws-exports si no lo has hecho
```javascript
Amplify.configure(awsmobile);
```

4. Llama APIs Storage APIs en tu código
```javascript
Storage.put('yourFile.txt', 'your key', {
        level: 'private', //access control level
        contentType: 'text/plain'
    })
    .then (result => console.log(result))
    .catch(err => console.log(err));
```
El componente Amplify Storage provee a los usuarios con APIs para
presentar los objetos balde PUT, GET, REMOVE and LIST. También se
puede configurar el componente para almacenar información en una
carpeta privada (autenticada) o en una pública. Esto puede ser
especificado usando la opción `level` con la llamada.
Para saber más acerca de los componente de la UI y otras llamadas API
para Storage, visita [AWS Amplify Storage
Guide](https://github.com/aws/aws-amplify/blob/master/media/storage_guide.md)

5. Pruébalo!

`npm run ios # or android`


## Modificando rutas Express en Lambda <a name="lambdamodify"></a>

La aplicación muestra invoca una función Lambda corriendo
[Express](https://expressjs.com) la cual hará operaciones CRUD hacia
DynamoDB dependiendo en la ruta de la que viene de la aplicación
cliente. Podrás modificar este comportamiento backend según tus
necesidades. Los pasos indican cómo podrías añadir funcionalidades
para _"delete a Pet"_ mostrándote que modificaciones serían necesarias
en la función Lambda y las correspondientes modificaciones de cliente
para hacer el pedido.

1. Después que has cloneado este repo, localiza
`./aws-mobile-react-native-starter/backend/lambdas/crud/app.js` y
encuentra la siguiente sección de código:

```javascript
app.listen(3000, function () {
  console.log('App started');
});
```

1. Inmediatamente **Antes de** éste codigo (_line_72_) añade el
siguiente código:

```javascript
app.delete('/items/pets/:petId', (req, res) => {
  if (!req.params.petId) {
    res.status(400).json({
      message: 'You must specify a pet id',
    }).end();
    return;
  }

  const userId = req.apiGateway.event.requestContext.identity.cognitoIdentityId;

  dynamoDb.delete({
    TableName: PETS_TABLE_NAME,
    Key: {
      userId: userId,
      petId: req.params.petId,
    }
  }, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({
        message: 'Could not delete pet'
      }).end();
    } else {
      res.json(null);
    }
  });
});
```

2. Guarda el archivo y en la consola para tu proyecto Mobile Hub haz
click en la carta **Cloud Logic**. Expande la sección **View resource
details ** y denota el nombre de la **Lambda function** en la lista
para el próximo paso. Debería ser algo similar a
**Pets-itemsHandler-mobilehub-XXXXXXXXX**.

3. Navega en una terminal a `./aws-mobile-react-native-starter/backend` y corre:

```
npm run build-lambdas
aws lambda update-function-code --function-name FUNCTION_NAME
--zip-file fileb://lambdas/crud-lambda.zip
```

**REEMPLAZA el FUNCTION_NAME con el nombre de tu función Lambda del
paso anterior.**

Esto podría tomar un momento para completar basado en tu conexión a
internet. Por favor sé paciente.
Alternativamente podrías clickear el recurso de la función Lambda en
la consola Mobile Hub la cual abre la consola Lambda y presiona el
botón **Upload** en esa página para subir el archivo
**lambdas/crud-lambda.zip**.

5. Ahora que has actualizado el backend Cloud Logic, modifica el
cliente para llamar la nueva ruta API. En el directorio
`./aws-mobile-react-native-starter/client/src/Screens` edita
`ViewPet.jsx`

  - Añade los siguientes imports
```javascript
import { Button } from 'react-native-elements';
import awsmobile from '../../aws-exports';
import API from '../../lib/Categories/API';
```

  - Añade la siguiente función **ANTES** del método **render()**:
```javascript
  async handleDeletePet(petId) {
    const cloudLogicArray = JSON.parse(awsmobile.aws_cloud_logic_custom);
    const endPoint = cloudLogicArray[0].endpoint;
    const requestParams = {
      method: 'DELETE',
      url: `${endPoint}/items/pets/${petId}`,
    }

    try {
      await API.restRequest(requestParams);

      this.props.navigation.navigate('Home');
    } catch (err) {
      console.log(err);
    }
  }
```

  - En el planteamiento `return` del método `render` añade un nuevo
botón despúes de `<View style={styles.breaker} />`:
```javascript
// ...
      <View style={styles.breaker} />
      <Button
          fontFamily='lato'
          backgroundColor={colors.red}
          large
          title="DELETE PET"
          onPress={this.handleDeletePet.bind(this, pet.petId)} />
// ...
```
6. Guarda el archivo y lanza la aplicación de nuevo:

```
cd ./aws-mobile-react-native-starter/client
npm run ios # or android
```

Si anteriormente has subido mascotas, haz click en su previsualización
en la página principal (Si no, sube una ahora). Deberías ver un nuevo
botón **DELETE PET**. Haz click sobre el y la mascota debería
desaparecer de la pantalla. El archivo también debió haber sido
removido de la tabla DynamoDB. Puedes validar esto al ir a la sección
**Resources** en tu proyecto Mobile Hub y abriendo la tabla DynamoDB.

## Información de Seguridad

### Almacenamiento Remoto

Esta aplicación de inicio sube contenido a una cubeta S3. La cubeta
S3 está configurada por Mobile Hub para usar control de acceso fino
para soportar acceso privado, publico y protegido, puedes conseguir
más información aquí
(http://docs.aws.amazon.com/mobile-hub/latest/developerguide/user-data-storage.html).
Para aprender más sobre restricción a este acceso, visita [Amazon S3
Security Considerations](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/s3-security.html).

### Almacenamiento Local

Esta aplicacion de inicio usa el [AsyncStorage] de React Native
(https://facebook.github.io/react-native/docs/asyncstorage.html) para
persistir localmente monedas de usuarios (accessKeyId, secretAccessKey
and sessionToken). Puedes tomar más acciones de seguridad mediante la
encriptación de ellas.

### API Handler Table Permissions

La función Lambda en esta aplicación de inicio escribirá y leerá a
DynamoDB y a su rol se le otargarán los permisos apropiados para
llevar a cabo tales acciones. Si deseas modificar la muestra para
llevar unas acciones más restrictas, visita [Authentication and Access
Control for Amazon
DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/authentication-and-access-control.html).
