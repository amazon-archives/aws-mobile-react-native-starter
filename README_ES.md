# AWS Mobile Aplicación React Native Starter - Serverless Pet Tracker

Bootstrap de una aplicación de React Native en AWS. Este iniciador automáticamente provee una infraestructura sin servidor con autenticación, autorización, almacenamiento de imágenes, acceso API y operaciones en la base de datos. También incluye registro de usuario y soporte MFA. El caso de muestra es un "Pet Tracker" El cual después de que un usuario se registra e ingresa pueden subir fotos de sus máscotas al sistema con información tal como su cumpleaño o raza.

Un blog de apoyo para este repositorio se puede encontrar en el Blog AWS Mobile: [Announcing: React Native Starter Project with One-Click AWS Deployment and Serverless Infrastructure](https://aws.amazon.com/blogs/mobile/announcing-react-native-starter-project-with-one-click-aws-deployment-and-serverless-infrastructure/). 

Este iniciador utiliza el [AWS Amplify JavaScript library](https://github.com/aws/aws-amplify) para darle soporte en la nube a la aplicaciónto.

### Enlaces rápidos
 - [Empezando](#Getting-Started)
 - [Uso de los componentes de registro e inicio de sesión en su aplicación](#advanced-auth)
 - [Accediendo a la APIs con REST](#restclient)
 - [Almacenar imágenes, videos y otros contenidos en la nube](#storage)
 - [Modificando Cloud Logic with Lambda for your app](#lambdamodify)

## Vista de arquitectura
![Architecture](https://s13.postimg.org/c6fim5blz/architecture.png)

Servicios AWS utilizados:
* Amazon Cognito User Pools
* Amazon Cognito Federated Identities
* Amazon API Gateway
* AWS Lambda
* Amazon DynamoDB
* Amazon S3
* AWS Mobile Hub

## Prerequisitos
- Cuenta de AWS
- [Xcode](https://developer.apple.com/xcode/) / [Android Studio](https://developer.android.com/studio/index.html)
- [Node.js](https://nodejs.org/) con NPM 
  - `npm install -g react-native-cli`
  - `npm install -g create-react-native-app`
- [AWS Mobile CLI](https://github.com/aws/awsmobile-cli)
  - `npm install -g awsmobile-cli`
- (_Optional_) [Watchman](https://facebook.github.io/watchman/)
  - On macOS, se recomienda para la instalación utilizar [Homebrew](https://brew.sh/)
    - `brew install watchman`
- (_Optional_) [AWS CLI](https://aws.amazon.com/cli/)  

## Empezando <a name="empezando"></a>

1. Crea los servicios y descarga el código de ejemplo dentro del directorio my-project.
    ```
    $ awsmobile start my-project react-native
    ```


2. Finalmente para iniciar la aplicación::

    ```
    $ cd my-project
    $ npm i
    $ npm run ios #npm run android
    ```

 Listo!

## Guía de Aplicación

1. En un celular o emulador/simulador, abre la aplicación
2. Selecciona el símbolo en la pestaña **SIGN UP** en la parte inferior derecha para registrar un nuevo usuario. Un correo electrónico válido y un número de teléfono serán necesarios para confirmar tu registro.
3. Haz click en **Sign Up** y recibirás un código via SMS. Ingresa este código y presiona **OK**.
3. De la pestaña **Sign in** de la aplicación, ingresa el  _Username_ y _Password_ del usuario que acabas de registrar y selecciona **SIGN IN**.
4. Un código se te enviará via SMS. Ingresa ese código y presiona **OK**.

5. Presiona el simbolo de adición (+) y sube una foto. Después de seleccionar una foto selecciona el **Check mark**.
6. Llena algunos detalles como el nombre, fecha de nacimiento, raza y género de tu mascota. Presiona **Add Pet** para subir la foto. Esto primero transferirá la foto a una cubeta S3 a la cual sólo el usuario conectado tiene acceso, luego escribirá el archivo a una DynamoDB table (vía API Gateway y Lambda) que también esta restringida a cada usuario a la vez.

![Add Pet](https://s14.postimg.org/435o88dup/Nadia1.png)

6. Verás el registro de tu mascota en la pantalla de inicio.

![My Pets](https://s14.postimg.org/yxcx601ht/Nadia2.png)

## usa funciones en tu aplicación.

Este iniciador usa la librería AWS Amplify para integrarse con AWS. Los componentes de la librería pueden ser usados en tu aplicación para añadir capacidades fácilmente para Autenticación, Almacenamiento y acceso API.  

Necesitaras [Create React Native App](https://github.com/react-community/create-react-native-app) para las siguientes secciones.

- Crea una nueva aplicación React Native (CRNA) utilizando `create-react-native-app`
- `cd` en tu nuevo app dir.
- Expulsa tu aplicación React Native (en nuestros ejemplos llámala "myapp")
```sh
create-react-native-app <project-directory>
cd <project-directory>
npm run eject # Eject as "React Native"
```
- Descarga el archivo `aws-exports.js` de tu proyecto AWS MobileHub como se describió anteriormente en la sección [Empezando](#Empexando). Colóquelo en la raíz de su nuevo directorio CRNA.


### Autenticación <a name="#Authentication"></a>

1. Instala dependencias con `npm install`

2. Instala dependencias adicionales:

```
npm install aws-amplify --save
npm install aws-amplify-react-native --save
```

3. Enlaza los componente nativos lanzando: `react-native link`

4. Abre el archivo `App.js`.

5. Importa el módulo `Auth` de la librería y aws-exports aquí
```javascript
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import {awsmobile} from './aws-exports';
```

6. Edita tu componente de aplicación para transformarlo en uno que soporte `Auth`  
```javascript
Amplify.configure(awsmobile);
export default withAuthenticator(class App extends React.Component {
  // ...
});
```
7. Pruébalo!
`npm run ios # or android`

El componente withAuthenticator añade las capacidades Sign Up, Sign In con MFA y Sign Out a tu aplicación directamente. Puedes usar este Higher Order Component,  o crea tu propio UI y usar los APIs de [Amplify](https://github.com/aws/aws-amplify/blob/master/media/authentication_guide.md) también.


### APIs en la nube y Control de Acceso Backend<a name="restclient"></a>
Para acceder a recursos en tu cuenta AWS que están protegidos vía AWS [Identity and Access Management](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) necesitarás firmar tus HTTP request usando el proceso de firmado [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) signing process. El iniciador de la aplicación utiliza el API component de [Amplify](https://github.com/aws/aws-amplify) para hacer HTTP request al.

Para hacer llamadas autenticadas a tu API, necesitarás usar el componente Auth de la librería primero para obtener las Authenticated. También puedes hacer pedidos sin autenticar a tu API.   

1. Instala dependencias adicionales  
`npm install aws-amplify-react-native --save`

2. Importa el archivo `aws-exports.js` 
```javascript
import awsmobile from './aws-exports';
```

3. Importa el componente API de la libreria
```javascript
import Amplify, { API } from 'aws-amplify';
```

4.Configura Amplify //puedes omitir este paso si Amplify ya está configurado en las secciones previas en Auth
```javascript
Amplify.configure(awsmobile)
```

5. Edita tu componente de aplicación para usar las funciones API de Amplify para hacer llamadas REST para tu API:   
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

6. ¡Pruébalo!  
`npm run ios # or android`

7. Ahora puedes invocar APIs en API Gateway desde tu aplicación en React Native que son protegidos vía AWS IAM. Puedes usar otras llamadas REST como se muestra en esta guía [AWS Amplify API component](https://github.com/aws/aws-amplify/blob/master/media/api_guide.md)

### Almacenando contenido en la nube <a name="storage"></a>
Muchas aplicaciones el dia de hoy proveen muchos medios tales como imágenes o videos. Algunas veces también son privados para los usuarios. El módulo de almacenamiento AWS Amplify da un mecanismo simple para administrar el almacenamiento del contenido del usuario  público o privado.

El componente `Storage` requiere credenciales AWS para llamar a Amazon S3. Si necesitas almacenar datos en directorios restringidos solo para el usuario, primero necesitarás completar la sección Auth. Porfavor sigue los pasos de la sección anterior [Authentication](#advanced-auth).

1. Importa el componente de almacenamiento de la biblioteca
```javascript
import Amplify, { Storage } from 'aws-amplify'
```

2. Importa el archivo `aws-exports.js` si aún no lo has hecho
```javascript
import awsmobile from './aws-exports';
```

3. Configura Storage utilizando tu aws-exports si aún no lo has hecho
```javascript
Amplify.configure(awsmobile);
```

4. Llama APIs Storage en tu código
```javascript
Storage.put('yourFile.txt', 'your key', {
        level: 'private', //access control level
        contentType: 'text/plain' 
    })
    .then (result => console.log(result))
    .catch(err => console.log(err));
```
El componente Amplify Storage provee a los usuarios con APIs paraacceder a los objetos del bucket tales como PUT, GET, REMOVE y LIST. El componente también es configurable para almacenar datos en carpetas tanto privadas (Authenticated) ó la pública. Esto se puede especificando la opción `level` con la llamada. 
Para aprender más sobre los componentes UI components y otras llamadas API para Storage, consulte [AWS Amplify Storage Guide](https://github.com/aws/aws-amplify/blob/master/media/storage_guide.md)

5. ¡Pruébalo!  
`npm run ios # or android`


## Modificando rutas Express en Lambda <a name="lambdamodify"></a>

La muestra de la aplicación invoca una función Lambda ejecutándose [Express](https://expressjs.com) que hará que las operaciones CRUD a DynamoDB dependan de la ruta que se pase desde la aplicación del cliente. Es posible que desee modificar este comportamiento de back-end para sus propias necesidades. Los pasos describen cómo podría agregar funcionalidad a _"delete a Pet"_ mostrando qué modificaciones serían necesarias en la función Lambda y las modificaciones correspondientes del cliente para realizar la solicitud.

1. Después de clonar este repo, localiza `./aws-mobile-react-native-starter/backend/lambdas/crud/app.js` y encuentra la siguiente sección en el código:

```javascript
app.listen(3000, function () {
  console.log('App started');
});
```

1. Immediatamente **Antes de** este código (_line_72_) añade el siguiente código:

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

2. Guarda el archivo y en la consola de tu proyecto Mobile Hub haz click en la carte **Cloud Logic**. Expande la sección **View resource details** section y denota el nombre de la **Lambda function** en la lista para el siguiente paso. Debería ser algo parecido a **Pets-itemsHandler-mobilehub-XXXXXXXXX**.

3. Navega en una terminal a `./aws-mobile-react-native-starter/backend` and run:

```
npm run build-lambdas
aws lambda update-function-code --function-name FUNCTION_NAME --zip-file fileb://lambdas/crud-lambda.zip
```

**REEMPLAZA el FUNCTION_NAME con el nombre de tu función Lambda del paso anterior.**

Esto podría tomar un momento para completar basado en tu conexión a internet. por favor sea paciente.

Alternativamente podrías clickear el recurso de la función Lambda en la consola Mobile Hub la cual abre la consola Lambda y presiona el botón **Upload** en esa página para subir el archivo **lambdas/crud-lambda.zip**.

5. Ahora que has actualizado el Cloud Logic backend modifica el cliente para llamar a la nueva ruta API. En el directorio `./aws-mobile-react-native-starter/client/src/Screens` edita `ViewPet.jsx`

  - Añade los siguientes imports
```javascript
import { Button } from 'react-native-elements';
import awsmobile from '../../aws-exports';
import API from '../../lib/Categories/API';
```

  - Añade la siguiente función **BEFORE** del método **render()**:
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

  - en la declaración `return` del método `render` añade un nuevo botón después de `<View style={styles.breaker} />`:
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

+Si anteriormente has subido mascotas, haz click en su previsualización en la página principal (Si no, sube una ahora). Deberías ver un nuevo botón **DELETE PET**. Haz click sobre el y la mascota debería desaparecer de la pantalla. El archivo también debió haber sido removido de la DynamoDB table. Puedes validar esto al ir a la sección **Resources** en tu proyecto Mobile Hub y abriendo la DynamoDB table. 

## Información de Seguridad

### Almacenamiento Remoto

Esta aplicación de inicio sube contenido a una cubeta S3. La cubeta S3 es configurada por Mobile Hub para restringir el acceso y para soportar acceso privado, publico y protegido, puedes conseguir más información [aquí](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/user-data-storage.html). Para aprender más sobre restricción de acceso, consulta [Amazon S3 Security Considerations](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/s3-security.html).

### Almacenamiento Local

Esta aplicacion de inicio usa el React Native [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) para persistir localmente llaves de usuario (accessKeyId, secretAccessKey y sessionToken). Puedes tomar más acciones de seguridad mediante la encriptación de ellas.

### Controlador de API y permisos de las tablas

La función Lambda en esta aplicación de inicio escribirá y leerá a DynamoDB y a su rol se le otargarán los permisos apropiados para llevar a cabo tales acciones. Si deseas modificar la muestra parallevar unas acciones más restrictas, consulta [Authentication and Access Control for Amazon DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/authentication-and-access-control.html).
