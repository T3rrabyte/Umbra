let umbra;
let shaderProgramInfo;

onload = () => {
	umbra = new Umbra();
	shaderProgramInfo = new DefaultShaderProgramInfo(umbra.gl);

	/*
	umbra = new Umbra();

	const scene = new GameObject();
	new Background(scene, 0x50 / 0xFF, 0xC8 / 0xFF, 0x78 / 0xFF);
	new CanvasResizer(scene);

	umbra.scene = scene;
	*/
};
