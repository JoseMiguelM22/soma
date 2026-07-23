import React from 'react';

// Cuadro para las listas (Soporta indentación para sub-ítems como Heces o Reglas)
export const TextoMarca = ({ item, marcas, onToggle }) => {
  const isSubItem = item.startsWith('  -');
  return (
    <div className={`flex items-start gap-1 py-[1px] cursor-pointer w-full select-none hover:bg-slate-200/50 ${isSubItem ? 'pl-3' : ''}`} onClick={(e) => { e.preventDefault(); if(!isSubItem) onToggle(item); }}>
      {!isSubItem && (
        <div className="w-2.5 h-2.5 border border-black flex items-center justify-center font-bold text-[8px] shrink-0 bg-white mt-[1px]">
          {marcas[item] === 'X' ? <span className="text-black">X</span> : marcas[item] === '√' ? <span className="text-black">√</span> : ''}
        </div>
      )}
      {isSubItem && <div className="w-2.5 h-2.5 shrink-0"></div>}
      <span className="text-[8.5px] leading-[1.1] truncate text-black font-semibold">{item}</span>
    </div>
  );
};

export const CuadroCheck = ({ valor }) => (
  <div className="w-4 h-4 border border-black flex items-center justify-center text-[11px] font-bold bg-white text-black shrink-0">
    {valor || ''}
  </div>
);

// Cuaderno Rayado Calibrado para la columna derecha
export const LinedTextarea = ({ name, value, onChange }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    className="absolute inset-0 w-full h-full bg-transparent outline-none uppercase font-bold resize-none text-[12px] px-2 text-black z-10"
    style={{ lineHeight: '18px', backgroundImage: 'linear-gradient(transparent 17px, #000000 17px, #000000 18px)', backgroundSize: '100% 18px', paddingTop: '0px' }}
  ></textarea>
);

export const LinedBlock = ({ name, value, onChange, rows }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    className="w-full bg-transparent outline-none uppercase font-bold resize-none text-[12px] px-1 text-black relative z-10"
    style={{ lineHeight: '18px', backgroundImage: 'linear-gradient(transparent 17px, #000000 17px, #000000 18px)', backgroundSize: '100% 18px', paddingTop: '0px' }}
  ></textarea>
);

// ================= DICCIONARIO ESTRUCTURADO (IDÉNTICO AL WORD) =================
export const DICCIONARIO_IVSS = {
  p3_antecedentes: [
    { t: '1.- ANTECEDENTES PERSONALES', col1: ['1. 1- Adenitis','1. 2- Alergia','1. 3- Amigdalitis','1. 4- Artritis','1. 5- Asma','1. 6- Bilharzia','1. 7- Blenorragia','1. 8- Bronquitis','1. 9- Buba','1.10- Catarros','1.11- Chagas','1.12- Chancros','1.13- Difteria','1.14- Diarreas','1.15- Hansen','1.16- Influenzas','1.17- Necatoriasis','1.18- Necatoriasis'], col2: ['1.19- Neumonía','1.20- Otitis','1.21- Paludismo','1.22- Parásitos','1.23- Parotiditis','1.24- Pleuresía','1.25- Quirúrgicos','1.26- Rinofaringitis','1.27- Rubéola','1.28- Sarampión','1.29- Sífilis','1.30- Sindromes Disentéricos','1.31- T.B.C.','1.32- Tifoidea','1.33- Tosferina','1.34- Traumatismos','1.35- Vacunaciones','1.36- Otros'] },
    { t: '2.- ANTECEDENTES FAMILIARES\nESTADO DE SALUD O CAUSA DE LA MUERTE DE LOS PADRES...', col1: ['2. 1- Alergia','2. 2- Artritis','2. 3- Cáncer','2. 4- Cardio-vasculares','2. 5- Diabetes','2. 6- Enf. Digestivas'], col2: ['2. 7- Enf. Renales','2. 8- Intoxicaciones','2. 9- Neuromentales','2.10- Sífilis','2.11- T.B.C.','2.12- Otros'] },
    { t: '3.- HÁBITOS PSICOBIOLÓGICOS', col1: ['3. 1- Alcohol','3. 2- Chimó','3. 3- Deportes','3. 4- Drogas','3. 5- Ocupación','3. 6- Problemas Familiares'], col2: ['3. 7- Rasgos Personales','3. 8- Sexuales','3. 9- Siesta','3.10- Sueño','3.11- Tabaco','3.12- Otros'] }
  ],
  p3_funcional: [
    { t: '4.- GENERAL', col1: ['4. 1- Aumento de Peso','4. 2- Fiebre','4. 3- Nutrición','4. 4- Pérdida de Peso'], col2: ['4. 5- Sudores Nocturnos','4. 6- Temblores','4. 7- Otros'] },
    { t: '5.- PIEL', col1: ['5. 1- Cianosis','5. 2- Edemas','5. 3- Erupciones'], col2: ['5. 4- Pigmentaciones','5. 5- Prurito','5. 6- Otros'] },
    { t: '6.- CABEZA', col1: ['6. 1- Caída del Cabello','6. 2- Cefalea','6. 3- Mareos'], col2: ['6. 4- Síncope','6. 5- Traumas','6. 6- Otros'] },
    { t: '7.- OJOS', col1: ['7. 1- Amaurosis','7. 2- Anteojos','7. 3- Cansancio Ocular','7. 4- Diplopia'], col2: ['7. 5- Dolor','7. 6- Fotofobia','7. 7- Lagrimeo','7. 8- Otros'] }
  ],
  p4_funcional: [
    { t: '8.- OIDOS', col1: ['8. 1- Dolor','8. 2- Secreciones','8. 3- Sordera'], col2: ['8. 4- Tinitus','8. 5- Vértigo','8. 6- Otros'] },
    { t: '9.- NARIZ', col1: ['9. 1- Catarros','9. 2- Epistaxis','9. 3- Obstrucciones'], col2: ['9. 4- Secreción Nasal','9. 5- Sinusitis','9. 6- Otros'] },
    { t: '10.- BOCA', col1: ['10. 1- Dientes','10. 2- Halitosis'], col2: ['10. 3- Mucosas','10. 4- Otros'] },
    { t: '11.- GARGANTA', col1: ['11. 1- Disfagia','11. 2- Dolor'], col2: ['11. 3- Ronquera','11. 4- Otros'] },
    { t: '12.- RESPIRATORIO', col1: ['12. 1- Disnea','12. 2- Dolor en el Pecho','12. 3- Esputos'], col2: ['12. 4- Hemoptisis','12. 5- Tos','12. 6- Otros'] },
    { t: '13.- OSTEOMUSCULAR', col1: ['13. 1- Artralgias','13. 2- Debilidad','13. 3- Dolores Oseos'], col2: ['13. 4- Deformidades','13. 5- Otros'] },
    { t: '14.- CARDIOVASCULAR', col1: ['14. 1- Angustias','14. 2- Disnea','14. 3- Dolor','14. 4- Palpitaciones','14. 5- Taquicardia'], col2: ['14. 6- Vértigos','14. 7- Claudicación','14. 8- Trastornos Parestésicos','14. 9- Varicosidades','14.10- Otros'] },
    { t: '15.- GASTROINTESTINAL', col1: ['15. 1- Apetito','15. 2- Constipación','15. 3- Diarrea','15. 4- Dolor','15. 5- Heces; Tipo','  - Color','  - Mucosidad','  - Sangre','15. 6- Eructos'], col2: ['15. 7- Flatulencia','15. 8- Hemorroides','15. 9- Hernias','15.10- Malestar','15.11- Náuseas','15.12- Parásitos','15.13- Pirosis','15.14- Vómitos','15.15- Otros'] },
    { t: '16.- GENITOURINARIO', col1: ['16. 1- Dolor','16. 2- Enuresis','16. 3- Hematuria','16. 4- Incontinencia','16. 5- Micciones'], col2: ['16. 6- Nicturia','16. 7- Piuria','16. 8- Secreciones','16. 9- Ulceras','16.10- Otros'] },
    { t: '17.- GINECOLÓGICOS', col1: ['17. 1- Menarquia','17. 2- Abortos','17. 3- Partos','17. 4- Dispareunia','17. 5- Frigidez','17. 6- Menopausia'], col2: ['17. 7- Reglas; Tipo','  - Cantidad','  - Dolor','  - Ultima Regla','17. 8- Flujo','17. 9- Otros'] },
    { t: '18.- NERVIOSO Y MENTAL', col1: ['18. 1- Convulsiones','18. 2- Estática','18. 3- Estado Emocional','18. 4- Marcha','18. 5- Parálisis'], col2: ['18. 6- Temblor','18. 7- Tics','18. 8- Tipo de Personalidad','18. 9- Otros'] }
  ],
  p5_fisico: [
    { t: '1.- PIEL', col1: ['1. 1- Color','1. 2- Humedad','1. 3- Contextura','1. 4- Temperatura','1. 5- Pigmentación','1. 6- Equimosis','1. 7- Cianosis','1. 8- Petequias','1. 9- Erupción'], col2: ['1.10- Uñas','1.11- Nódulos','1.12- Vascularización','1.13- Cicatrices','1.14- Fístulas','1.15- Ulceras','1.16- Otros'] },
    { t: '2.- CABEZA', col1: ['2. 1- Configuración','2. 2- Fontanelas','2. 3- Reblandecimiento','2. 4- Circunferencia'], col2: ['2. 5- Dolor','2. 6- Cabellos','2. 7- Otros'] },
    { t: '3.- OJOS', col1: ['3. 1- Conjuntiva','3. 2- Esclerótica','3. 3- Córnea','3. 4- Pupilas','3. 5- Movimientos','3. 6- Desviación'], col2: ['3. 7- Nistagmus','3. 8- Ptosis','3. 9- Exoftalmos','3.10- Agudeza Visual','3.11- Oftalmoscópicos','3.12- Otros'] },
    { t: '4.- OIDOS', col1: ['4. 1- Pabellón','4. 2- Conducto Externo','4. 3- Tímpano','4. 4- Audición'], col2: ['4. 5- Secreciones','4. 6- Mastoides','4. 7- Dolor','4. 8- Otros'] },
    { t: '5.- NARIZ', col1: ['5. 1- Fosas Nasales','5. 2- Mucosa','5. 3- Tabique','5. 4- Meatos'], col2: ['5. 5- Diafanoscopia','5. 6- Sensibilidad Senos','5. 7- Secreción Nasal','5. 8- Otros'] },
    { t: '6.- BOCA', col1: ['6. 1- Aliento','6. 2- Labios','6. 3- Dientes','6. 4- Encías','6. 5- Mucosas'], col2: ['6. 6- Lengua','6. 7- Conductos Salivares','6. 8- Parálisis y trismo','6. 9- Otros'] },
    { t: '7.- FARINGE', col1: ['7. 1- Amaurosis','7. 2- Anteojos','7. 3- Cansancio Ocular'], col2: ['7. 4- Dolor','7. 5- Fotofobia','7. 6- Lagrimeo'] },
    { t: '8.- CUELLO', col1: ['8. 1- Movilidad','8. 2- Ganglios','8. 3- Tiroides'], col2: ['8. 4- Vasos','8. 5- Tráquea','8. 6- Otros'] },
    { t: '9.- GANGLIOS LINFÁTICOS', col1: ['9. 1- Cervicales','9. 2- Occipitales','9. 3- Supraclaviculares','9. 4- Axilares'], col2: ['9. 5- Epitrocleares','9. 6- Inguinales','9. 7- Otros'] }
  ],
  p6_fisico: [
    { t: '10.- TORAX', col1: ['10. 1- Forma','10. 2- Simetría','10. 3- Expansión'], col2: ['10. 4- Palpación','10. 5- Respiración','10. 6- Otros'] },
    { t: '11.- SENOS', col1: ['11. 1- Nódulos','11. 2- Secreciones'], col2: ['11. 3- Pezones','11. 4- Otros'] },
    { t: '12.- PULMONES', col1: ['12. 1- Fremito','12. 2- Percusión','12. 3- Auscultación','12. 4- Ruidos Adventicios'], col2: ['12. 5- Pectoriloquia Afona','12. 6- Broncofonia','12. 7- Otros'] },
    { t: '13.- CORAZÓN', col1: ['13. 1- Latido de la Punta','13. 2- Thrill','13. 3- Pulsación','13. 4- Ritmo'], col2: ['13. 5- Ruidos','13. 6- Galopes','13. 7- Frotes','13. 8- Otros'] },
    { t: '14.- VASOS SANGUÍNEOS', col1: ['14. 1- Pulso','14. 2- Paredes Vasculares'], col2: ['14. 3- Caracteres','14. 4- Otros'] },
    { t: '15.- ABDOMEN', col1: ['15. 1- Aspecto','15. 2- Circunferencia','15. 3- Peristalsis','15. 4- Cicatrices','15. 5- Defensa','15. 6- Sensibilidad','15. 7- Contractura'], col2: ['15. 8- Tumoraciones','15. 9- Ascitis','15.10- Hígado','15.11- Riñones','15.12- Bazo','15.13- Hernias','15.14- Otros'] },
    { t: '16.- GENITALES MASCULINOS', col1: ['16. 1- Cicatrices','16. 2- Lesiones','16. 3- Secreciones','16. 4- Escroto','16. 5- Epidídimo'], col2: ['16. 6- Deferentes','16. 7- Testículos','16. 8- Próstata','16. 9- Seminales','16.10- Otros'] },
    { t: '17.- GENITALES FEMENINOS', col1: ['17. 1- Labios','17. 2- Bartholino','17. 3- Periné','17. 4- Vagina','17. 5- Cuello'], col2: ['17. 6- Utero','17. 7- Anexos','17. 8- Parametrios','17. 9- Douglas','17.10- Otros'] },
    { t: '18.- RECTO', col1: ['18. 1- Fisuras','18. 2- Fístulas','18. 3- Hemorroides','18. 4- Esfínter'], col2: ['18. 5- Tumoraciones','18. 6- Prolapso','18. 7- Heces','18. 8- Otros'] },
    { t: '19.- HUESOS, ARTICULACIONES, MÚSCULOS', col1: ['19. 1- Deformidades','19. 2- Inflamaciones','19. 3- Rubicundes','19. 4- Sensibilidad'], col2: ['19. 5- Movimientos','19. 6- Masas Musculares','19. 7- Otros'] },
    { t: '20.- EXTREMIDADES', col1: ['20. 1- Color','20. 2- Edema','20. 3- Temblor','20. 4- Deformidades'], col2: ['20. 5- Ulceras','20. 6- Várices','20. 7- Otros'] },
    { t: '21.- NEUROLÓGICO Y PSÍQUICO', col1: ['21. 1- Sensibilidad Objetiva','21. 2- Motilidad','21. 3- Reflectividad','21. 4- Escritura','21. 5- Tróficos','21. 6- Marcha'], col2: ['21. 7- Romberh','21. 8- Orientación','21. 9- Lenguaje','21.10- Coordinación','21.11- Otros'] }
  ]
};