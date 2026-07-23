import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { TextoMarca, LinedTextarea, DICCIONARIO_IVSS } from './SharedIVSS';

export default function Parte3({ formIVSS, handleIVSSChange, marcas, toggleMarca }) {
  return (
    <>
      {/* ================= PÁGINA 5: PARTE III (Pág 1) ================= */}
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
            <div className="text-[11px] font-bold mb-1">Forma: 15-108-B</div>
            <div className="text-xl font-black tracking-widest mt-2">HISTORIA CLINICA</div>
            <div className="text-base font-bold tracking-widest">PARTE III</div>
          </div>
        </div>

        <table className="w-full border-collapse border-[2px] border-black text-[10px] font-bold mb-2 shrink-0 bg-white text-black relative z-20">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 align-top w-1/4">CENTRO ASISTENCIAL:<br/><input type="text" name="centro_asistencial" value={formIVSS.centro_asistencial} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold" /></td>
              <td className="border border-black p-1.5 align-top text-center text-sm w-[20%]">HISTORIA Nº:<br/><input type="text" name="historia_n" value={formIVSS.historia_n} onChange={handleIVSSChange} className="w-full bg-transparent outline-none text-center font-bold" /></td>
              <td colSpan="4" className="border border-black p-1.5 align-top border-l-[2px] border-black">APELLIDOS Y NOMBRES DEL PACIENTE:<br/><input type="text" name="apellidos_nombres" value={formIVSS.apellidos_nombres} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-1 align-top w-[35%] h-6">SERVICIO: <input type="text" name="servicio" value={formIVSS.servicio} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[70%]" /></td>
              <td className="border border-black p-1 align-top w-[10%]">PISO: <input type="text" name="piso" value={formIVSS.piso} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[60%]" /></td>
              <td className="border border-black p-1 align-top w-[15%]">ALA: <input type="text" name="ala" value={formIVSS.ala} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[70%]" /></td>
              <td className="border border-black p-1 align-top w-[20%] border-l-[2px] border-black">SALA O CUARTO: <input type="text" name="sala_cuarto" value={formIVSS.sala_cuarto} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[50%]" /></td>
              <td className="border border-black p-1 align-top w-[20%]">CAMA: <input type="text" name="cama" value={formIVSS.cama} onChange={handleIVSSChange} className="bg-transparent outline-none uppercase font-bold w-[60%]" /></td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between font-bold text-[10px] mb-2 px-1 shrink-0 text-black relative z-20">
          <span className="flex items-center">TEMPERATURA: <input type="number" step="0.1" name="temperatura" value={formIVSS.temperatura} onChange={handleIVSSChange} className="w-12 border-b border-black text-center bg-transparent outline-none ml-1" /> °C.</span>
          <span className="flex items-center">PULSO: <input type="text" name="pulso" value={formIVSS.pulso} onChange={handleIVSSChange} className="w-12 border-b border-black text-center bg-transparent outline-none ml-1" /> P.P.M.</span>
          <span className="flex items-center">RESPIRACION: <input type="text" name="respiracion" value={formIVSS.respiracion} onChange={handleIVSSChange} className="w-12 border-b border-black text-center bg-transparent outline-none ml-1" /> R.P.M.</span>
          <span className="flex items-center">TENSION ARTERIAL: MX <input type="text" name="ta_mx" value={formIVSS.ta_mx} onChange={handleIVSSChange} className="w-10 border-b border-black text-center bg-transparent outline-none mx-1" /> MN: <input type="text" name="ta_mn" value={formIVSS.ta_mn} onChange={handleIVSSChange} className="w-10 border-b border-black text-center bg-transparent outline-none ml-1" /></span>
          <span className="flex items-center">PESO: <input type="text" name="peso" value={formIVSS.peso} onChange={handleIVSSChange} className="w-12 border-b border-black text-center bg-transparent outline-none ml-1" /> KGS.</span>
        </div>

        <table className="w-full border-collapse border-x-[2px] border-t-[2px] border-black text-[9px] font-bold mb-0 shrink-0 bg-white text-black relative z-20">
          <tbody>
            <tr>
              <td className="border-b border-r-[2px] border-black p-1.5 w-[45%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">√</span> lo encontrado normal después de examinar.<br/>Dejar en blanco lo no examinado o interrogado.</td>
              <td className="border-b border-black p-1.5 w-[55%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">X</span> en la columna de la izquierda lo encontrado anormal al examen y describirlo en esta<br/>columna, usando los números de la referencia dada para ahorrar espacio y tiempo al escribirlo.</td>
            </tr>
          </tbody>
        </table>

        <div className="flex border-[2px] border-t-0 border-black w-full flex-1 overflow-hidden bg-white text-black mt-[1px]">
          <div className="w-[45%] border-r-[2px] border-black flex flex-col p-1 text-[9px] overflow-hidden bg-white">
            <div className="w-full text-center font-bold text-[11px] mb-1 bg-gray-100/50 py-1 border-b border-black">EXAMEN FÍSICO (Datos Objetivos)</div>
            
            {/* Iteramos Examen Físico Parte 1 con el título centrado */}
            {DICCIONARIO_IVSS.p5_fisico.map((block, i) => (
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
            <LinedTextarea name="desc_parte3_1" value={formIVSS.desc_parte3_1} onChange={handleIVSSChange} />
          </div>
        </div>

        {/* PIE DE PÁGINA PÁG 5 (Sin las firmas que van en la 6) */}
        <div className="flex justify-between text-[10px] mt-1 font-bold shrink-0 text-black">
          <span>A LA VUELTA</span>
          <span>HISTORIA III</span>
        </div>
      </div>

      {/* ================= PÁGINA 6: DORSO PARTE III (Pág 2) ================= */}
      <div className="bg-white text-black border border-gray-400 shadow-2xl w-[210mm] h-[297mm] p-8 font-sans box-border relative flex flex-col overflow-hidden">
        
        <div className="flex justify-between font-bold text-[10px] mb-1 text-black">
          <span></span>
          <span>Forma: 15-108-B</span>
        </div>

        <table className="w-full border-collapse border-[2px] border-black text-[9px] font-bold mb-0 shrink-0 bg-white text-black relative z-20">
          <tbody>
            <tr>
              <td className="border-r-[2px] border-black p-1.5 w-[45%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">√</span> lo encontrado normal después de examinar.<br/>Dejar en blanco lo no examinado o interrogado.</td>
              <td className="p-1.5 w-[55%]">Marcar así: <span className="inline-flex w-3 h-3 border border-black items-center justify-center font-black text-black">X</span> en la columna de la izquierda lo encontrado anormal al examen y describirlo en esta<br/>columna, usando los números de la referencia dada para ahorrar espacio y tiempo al escribirlo.</td>
            </tr>
          </tbody>
        </table>

        <div className="flex border-[2px] border-t-0 border-black w-full flex-1 overflow-hidden bg-white text-black mt-[1px]">
          <div className="w-[45%] border-r-[2px] border-black flex flex-col p-1 text-[9px] overflow-hidden bg-white">
            
            {/* Iteramos Examen Físico Parte 2 con el título centrado */}
            {DICCIONARIO_IVSS.p6_fisico.map((block, i) => (
              <div key={i} className="mb-1 mt-1">
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
            <LinedTextarea name="desc_parte3_2" value={formIVSS.desc_parte3_2} onChange={handleIVSSChange} />
          </div>
        </div>

        {/* AQUÍ VAN LAS FIRMAS, FECHA Y DIAGNÓSTICO (Al final del examen físico) */}
        <div className="flex justify-between text-[12px] mt-4 font-bold shrink-0 text-black relative z-20">
          <span className="flex items-end">Fecha del Examen: <input type="text" name="fecha_examen" value={formIVSS.fecha_examen} onChange={handleIVSSChange} className="border-b border-black w-48 ml-2 outline-none text-center" /></span>
          <span className="flex items-end">Examen Practicado por: <input type="text" name="examen_practicado_por" value={formIVSS.examen_practicado_por} onChange={handleIVSSChange} className="border-b border-black w-56 ml-2 outline-none text-center" /></span>
        </div>
        <div className="text-[12px] mt-2 font-bold flex items-end w-full shrink-0 text-black relative z-20">
          Diagnóstico del Servicio: <input type="text" name="diagnostico_servicio" value={formIVSS.diagnostico_servicio} onChange={handleIVSSChange} className="border-b border-black flex-1 ml-2 outline-none" />
        </div>

      </div>
    </>
  );
}