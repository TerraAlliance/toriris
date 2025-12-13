import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { View, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { observable } from "@legendapp/state";
import { useObservable, useValue, For } from "@legendapp/state/react";

// observable() crea un estado global de Legend State.
// Este es el unico estado que hay que sincronizar con la base de datos,
// ya que persiste y puede ser compartido entre múltiples componentes.

// No confundir con useObservable(), que crea un estado local del componente
// y solo vive mientras el componente está montado.

// La cantidad de pisos es un array porque es mas facil iterar sobre él para renderizarlos

const floors = observable([{}]);

// La app tiene una div que contiene el Canvas. Dentro del Canvas hay dos escenas separadas, World y Menu.
// World es la escena principal que contiene el mundo 3D en camara perspectiva.
// Menu es la escena secundaria que contiene el menu en camara ortogonal.
// Aunque World y Menu están fuera del Canvas, sus <View/> se renderizan dentro gracias a <View.Port/>.
// View es un componente que te permite mostrar distintas escenas en distintas regiones de la pantalla

export default function App() {
  const container = useRef();

  return (
    <div ref={container} style={{ position: "absolute", width: "100%", height: "100%" }}>
      <World />
      <Menu />
      <Canvas eventSource={container}>
        <View.Port />
      </Canvas>
    </div>
  );
}

// El componente View crea una div que lo contiene, cambias su estilo con el prop style.

function World() {
  return (
    <View style={{ position: "absolute", width: "100%", height: "85%", backgroundColor: "lightskyblue" }}>
      <PerspectiveCamera makeDefault position={[0, 3, 10]} />
      <ambientLight intensity={2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Building />
    </View>
  );
}

// El componente <For> de Legend-State itera un estado en forma de array y renderiza un componente por cada item.

function Building() {
  return (
    <For optimized each={floors}>
      {(item, key) => <Box scale={2} position={[0, key / 2, 0]} baseColor={`hsl(${key * 20}, 100%, 50%)`} />}
    </For>
  );
}

// useObservable crea un estado local dentro del componente.
// useValue suscribe el componente a ese estado para que se vuelva a renderizar cuando cambia el estado.
// useFrame se ejecuta en cada frame del render loop de R3F y permite animar objetos.

function Box({ baseColor, ...props }) {
  const hovered = useObservable(false);
  const isHovered = useValue(hovered);

  const meshRef = useRef();
  useFrame((state, delta) => (meshRef.current.rotation.y += delta));

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.set(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hovered.set(false);
      }}
    >
      <boxGeometry args={[1, 0.25, 1]} />
      <meshStandardMaterial color={isHovered ? "hotpink" : baseColor} />
    </mesh>
  );
}

// Para modificar un estado de legend state (tanto global como local) se usa el metodo .set()
// Si el observable es un array, se puede usar metodos de los arrays como push y pop para modificarlo.
// Para hacer lo mismo con .set() seria de la siguiente manera:
// const addFloor = () => floors.set([...floors.get(), {}]);
// const removeFloor = () => floors.set(floors.get().pop);

function Menu() {
  const addFloor = () => floors.push({});
  const removeFloor = () => floors.pop();

  return (
    <View style={{ position: "absolute", width: "100%", height: "15%", bottom: 0, backgroundColor: "lightpink" }}>
      <OrthographicCamera makeDefault position={[0, 0, 1000]} />
      <ambientLight intensity={2} />
      <directionalLight position={[0, 0, 1]} />
      <Button scale={40} position={[50, 0, 0]} onClick={addFloor} color={"palegreen"} />
      <Button scale={40} position={[-50, 0, 0]} onClick={removeFloor} color={"salmon"} />
    </View>
  );
}

function Button(props) {
  const hovered = useObservable(false);
  const isHovered = useValue(hovered);

  const meshRef = useRef();
  useFrame((state, delta) => (meshRef.current.rotation.y += delta));

  return (
    <mesh {...props} ref={meshRef} onPointerOver={(event) => hovered.set(true)} onPointerOut={(event) => hovered.set(false)}>
      <sphereGeometry args={[1]} />
      <meshStandardMaterial color={isHovered ? "hotpink" : props.color} />
    </mesh>
  );
}
