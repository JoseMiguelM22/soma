import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { TextoMarca, LinedTextarea, DICCIONARIO_IVSS } from './SharedIVSS';

export default function Parte2({ formIVSS, handleIVSSChange, marcas, toggleMarca }) {
  return (
    <>
      {/* PÁGINA 3: PARTE II */}
      <div className="bg-white text-black border border-gray-400 shadow-2xl w-[210mm] h-[297mm] p-8 font-sans box-border relative flex flex-col overflow-hidden">
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div className="flex items-center gap-3">
            
            {/* === LOGO IVSS REAL === */}
            <img src="/logoivss.jpg" alt="Logoivss" className="w-16 h-16 object-contain shrink-0 mix-blend-multiply" />
            <div className="text-[10px] font-bold leading-[1.3]">
              REPUBLICA BOLIVARIANA DE VENEZUELA<br/>MINISTERIO DEL PODER POPULAR PARA EL TRABAJO<br/>Y SEGURIDAD SOCIAL<br/>INSTITUTO VENEZOLANO DE LOS SEGUROS SOCIALES<br/>DIRECCION GENERAL DE SALUD
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold mb-1">Forma: 15-108</div>
            <div className="text-xl font-black tracking-widest mt-2">HISTORIA CLINICA</div>
            <div className="text-base font-bold tracking-widest">PARTE II</div>
          </div>
        </div>

        {/* TABLAS CON PADDING REDUCIDO PARA GANAR ESPACIO VERTICAL */}
        <table className="w-full border-collapse border-[2px] border-black text-[10px] font-bold mb-1.5 shrink-0 bg-white text-black relative z-20">
          <tbody>
            <tr>
              <td className="border border-black p-1 align-top w-1/4">CENTRO ASISTENCIAL:<br/><input type="text" name="centro_asistencial" value={formIVSS.centro_asistencial} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold" /></td>
              <td className="border border-black p-1 align-top text-center text-sm w-[20%]">HISTORIA Nº:<br/><input type="text" name="historia_n" value={formIVSS.historia_n} onChange={handleIVSSChange} className="w-full bg-transparent outline-none text-center font-bold" /></td>
              <td colSpan="4" className="border border-black p-1 align-top border-l-[2px] border-black">APELLIDOS Y NOMBRES DEL PACIENTE:<br/><input type="text" name="apellidos_nombres" value={formIVSS.apellidos_nombres} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-1 align-top w-[35%]">SERVICIO: <input type="text" name="servicio" value={formIVSS.servicio} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[70%]" /></td>
              <td className="border border-black p-1 align-top w-[10%]">PISO: <input type="text" name="piso" value={formIVSS.piso} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[60%]" /></td>
              <td className="border border-black p-1 align-top w-[15%]">ALA: <input type="text" name="ala" value={formIVSS.ala} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[70%]" /></td>
              <td className="border border-black p-1 align-top w-[20%] border-l-[2px] border-black">SALA O CUARTO: <input type="text" name="sala_cuarto" value={formIVSS.sala_cuarto} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[50%]" /></td>
              <td className="border border-black p-1 align-top w-[20%]">CAMA: <input type="text" name="cama" value={formIVSS.cama} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[60%]" /></td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border-x-[2px] border-black text-[9px] font-bold mb-0 shrink-0 bg-white text-black relative z-20">
          <tbody>
            <tr>
              <td className="border-b border-r-[2px] border-black p-1 w-[45%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">√</span> lo encontrado normal después de examinar.<br/>Dejar en blanco lo no examinado o interrogado.</td>
              <td className="border-b border-black p-1 w-[55%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">X</span> en la columna de la izquierda lo encontrado anormal al examen y describirlo en esta<br/>columna, usando los números de la referencia dada para ahorrar espacio y tiempo al escribirlo.</td>
            </tr>
          </tbody>
        </table>

        <div className="flex border-[2px] border-t-0 border-black w-full flex-1 overflow-hidden bg-white text-black mt-[1px]">
          <div className="w-[45%] border-r-[2px] border-black flex flex-col p-1 text-[9px] overflow-hidden bg-white">
            
            {/* Iteramos los antecedentes (Márgenes ajustados) */}
            {DICCIONARIO_IVSS.p3_antecedentes.map((block, i) => (
              <div key={i} className="mb-1">
                <div className="text-center font-bold text-[10px] mb-0.5 whitespace-pre-wrap leading-tight">{block.t}</div>
                <div className="flex w-full">
                  <div className="w-1/2 flex flex-col pr-1 border-r border-black/30">
                    {block.col1.map(item => <TextoMarca key={item} item={item} marcas={marcas} onToggle={toggleMarca} />)}
                  </div>
                  <div className="w-1/2 flex flex-col pl-1">
                    {block.col2.map(item => <TextoMarca key={item} item={item} marcas={marcas} onToggle={toggleMarca} />)}
                  </div>
                </div>
              </div>
            ))}

            <div className="w-full text-center font-bold text-[10px] mb-1 mt-1 bg-gray-100/50 py-0.5 border-y border-black">EXAMEN FUNCIONAL</div>
            
            {/* Iteramos el examen funcional (Márgenes ajustados) */}
            {DICCIONARIO_IVSS.p3_funcional.map((block, i) => (
              <div key={i} className="mb-1">
                <div className="text-center font-bold text-[9px] mb-0.5">{block.t}</div>
                <div className="flex w-full">
                  <div className="w-1/2 flex flex-col pr-1 border-r border-black/30">
                    {block.col1.map(item => <TextoMarca key={item} item={item} marcas={marcas} onToggle={toggleMarca} />)}
                  </div>
                  <div className="w-1/2 flex flex-col pl-1">
                    {block.col2.map(item => <TextoMarca key={item} item={item} marcas={marcas} onToggle={toggleMarca} />)}
                  </div>
                </div>
              </div>
            ))}

          </div>

          <div className="w-[55%] relative overflow-hidden bg-white">
            <LinedTextarea name="desc_parte2_1" value={formIVSS.desc_parte2_1} onChange={handleIVSSChange} />
          </div>
        </div>

        <div className="flex justify-between text-[10px] mt-1 font-bold shrink-0 text-black">
          <span>A LA VUELTA</span>
          <span>HISTORIA II</span>
        </div>
      </div>

      {/* PÁGINA 4: PARTE II (Pág 2) */}
      <div className="bg-white text-black border border-gray-400 shadow-2xl w-[210mm] h-[297mm] p-8 font-sans box-border relative flex flex-col overflow-hidden">
        
        <div className="flex justify-between font-bold text-[10px] mb-1 text-black">
          <span></span>
          <span>Forma: 15-108-A</span>
        </div>
        
        <table className="w-full border-collapse border-[2px] border-black text-[9px] font-bold mb-0 shrink-0 bg-white text-black relative z-20">
          <tbody>
            <tr>
              <td className="border-r-[2px] border-black p-1 w-[45%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">√</span> lo encontrado normal después de examinar.<br/>Dejar en blanco lo no examinado o interrogado.</td>
              <td className="p-1 w-[55%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">X</span> en la columna de la izquierda lo encontrado anormal al examen y describirlo en esta<br/>columna, usando los números de la referencia dada para ahorrar espacio y tiempo al escribirlo.</td>
            </tr>
          </tbody>
        </table>

        <div className="flex border-[2px] border-t-0 border-black w-full flex-1 overflow-hidden bg-white text-black mt-[1px]">
          <div className="w-[45%] border-r-[2px] border-black flex flex-col p-1 text-[9px] overflow-hidden bg-white">
            
            {/* Continuación de Examen Funcional */}
            {DICCIONARIO_IVSS.p4_funcional.map((block, i) => (
              <div key={i} className="mb-1">
                <div className="text-center font-bold text-[9px] mb-0.5">{block.t}</div>
                <div className="flex w-full">
                  <div className="w-1/2 flex flex-col pr-1 border-r border-black/30">
                    {block.col1.map(item => <TextoMarca key={item} item={item} marcas={marcas} onToggle={toggleMarca} />)}
                  </div>
                  <div className="w-1/2 flex flex-col pl-1">
                    {block.col2.map(item => <TextoMarca key={item} item={item} marcas={marcas} onToggle={toggleMarca} />)}
                  </div>
                </div>
              </div>
            ))}

          </div>
          <div className="w-[55%] relative overflow-hidden bg-white">
            <LinedTextarea name="desc_parte2_2" value={formIVSS.desc_parte2_2} onChange={handleIVSSChange} />
          </div>
        </div>
      </div>
    </>
  );
}