export type DemoImage = {
  source: any;
  label: string;
};

// Lista única con todas las imágenes en orden secuencial
export const demoImages: DemoImage[] = [
  // Recepcion final
  {
    source: require("../../../assets/1   seleccion recepcion finales/recepcion varias1.jpg"),
    label: "Recepcion varias 1",
  },
  {
    source: require("../../../assets/1   seleccion recepcion finales/recepcion varias2.jpg"),
    label: "Recepcion varias 2",
  },
  // 1er plato final
  {
    source: require("../../../assets/2   seleccion 1er plato finales/foto 1  filete a la parisienne y ragout de ternera.jpg"),
    label: "Filete a la parisienne y ragout de ternera",
  },
  {
    source: require("../../../assets/2   seleccion 1er plato finales/foto 2  matambre con rusa y tagliatelle cacio e pepe.jpg"),
    label: "Matambre con rusa y tagliatelle cacio e pepe",
  },
  // Plato principal adultos
  {
    source: require("../../../assets/3   plato principal adultos/foto 1   pasta 225.jpg"),
    label: "Pasta 225",
  },
  {
    source: require("../../../assets/3   plato principal adultos/foto 2   lomo al malbec.jpg"),
    label: "Lomo al malbec",
  },
  {
    source: require("../../../assets/3   plato principal adultos/foto 3   bbq ribs.jpg"),
    label: "BBQ ribs",
  },
  {
    source: require("../../../assets/3   plato principal adultos/foto 4   costillar.jpg"),
    label: "Costillar",
  },
  // Menu juveniles
  {
    source: require("../../../assets/4    menu juveniles/foto 1  1er plato juveniles noquis 2 salsas y ravioles 2 salsas.jpg"),
    label: "1er plato juveniles",
  },
  {
    source: require("../../../assets/4    menu juveniles/foto 2  principales juveniles.jpg"),
    label: "Principales juveniles",
  },
  // Menu infantiles
  {
    source: require("../../../assets/5    menu infantiles/foto 1  principales infantiles.jpg"),
    label: "Principales infantiles",
  },
  {
    source: require("../../../assets/5    menu infantiles/foto 2    postre infantil helado con rockets.jpg"),
    label: "Postre infantil helado con rockets",
  },
  // Postres
  {
    source: require("../../../assets/6   postres/foto 1   pavlova ddl.jpg"),
    label: "Pavlova ddl",
  },
  {
    source: require("../../../assets/6   postres/foto 2      brownie a la mode.jpg"),
    label: "Brownie a la mode",
  },
  {
    source: require("../../../assets/6   postres/foto 3    crumble ice.jpg"),
    label: "Crumble ice",
  },
  {
    source: require("../../../assets/6   postres/foto 4    rocher pasion.jpg"),
    label: "Rocher pasion",
  },
  {
    source: require("../../../assets/6   postres/foto 5      creme brulee.jpg"),
    label: "Creme brulee",
  },
  {
    source: require("../../../assets/6   postres/foto 6   panna cotta.jpg"),
    label: "Panna cotta",
  },
];
