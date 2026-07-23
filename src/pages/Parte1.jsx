import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { CuadroCheck, LinedBlock, LinedTextarea } from './SharedIVSS';

export default function Parte1({ formIVSS, handleIVSSChange, marcas, toggleMarca }) {
  return (
    <>
      {/* PÁGINA 1: ADMISIÓN */}
      <div className="bg-white text-black border border-gray-400 shadow-2xl w-[210mm] h-[297mm] p-8 font-sans box-border relative flex flex-col overflow-hidden">
        <div className="flex justify-between items-start mb-3 shrink-0">
          <div className="flex items-center gap-3">
            
            {/* === LOGO IVSS REAL === */}
            <img src="/logoivss.jpg" alt="Logoivss" className="w-16 h-16 object-contain shrink-0 mix-blend-multiply" />
            
            <div className="text-[10px] font-bold leading-[1.3] text-black">
              REPUBLICA BOLIVARIANA DE VENEZUELA<br/>MINISTERIO DEL PODER POPULAR PARA EL TRABAJO<br/>Y SEGURIDAD SOCIAL<br/>INSTITUTO VENEZOLANO DE LOS SEGUROS SOCIALES<br/>DIRECCION GENERAL DE SALUD
            </div>
          </div>
          <div className="text-right text-black">
            <div className="text-[11px] font-bold mb-1">Forma: 15-108</div>
            <div className="text-xl font-black tracking-widest mt-2">HISTORIA CLINICA</div>
            <div className="text-base font-bold tracking-widest">PARTE I</div>
          </div>
        </div>

        <table className="w-full border-collapse border-[2px] border-black text-[10px] font-bold leading-tight shrink-0 mb-3 bg-white text-black">
          <tbody>
            <tr>
              <td colSpan="4" className="border border-black p-1 align-top h-10 w-[60%] relative z-20">CENTRO ASISTENCIAL:<br/><input type="text" name="centro_asistencial" value={formIVSS.centro_asistencial} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-sm" /></td>
              <td colSpan="2" className="border border-black p-1 align-top border-l-[2px] border-black relative z-20"><span className="text-xs">HISTORIA Nº:</span> <input type="text" name="historia_n" value={formIVSS.historia_n} onChange={handleIVSSChange} className="w-full bg-transparent outline-none text-base font-black" /></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-1 align-top h-8 w-[35%] relative z-20">SERVICIO:<input type="text" name="servicio" value={formIVSS.servicio} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
              <td className="border border-black p-1 align-top w-[10%] relative z-20">PISO:<input type="text" name="piso" value={formIVSS.piso} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
              <td className="border border-black p-1 align-top w-[15%] relative z-20">ALA:<input type="text" name="ala" value={formIVSS.ala} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
              <td className="border border-black p-1 align-top w-[20%] border-l-[2px] border-black relative z-20">SALA O CUARTO:<input type="text" name="sala_cuarto" value={formIVSS.sala_cuarto} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
              <td className="border border-black p-1 align-top w-[20%] relative z-20">CAMA:<input type="text" name="cama" value={formIVSS.cama} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-xs" /></td>
            </tr>
            <tr><td colSpan="6" className="border border-black p-1 bg-gray-100/50">DATOS DEL PACIENTE:</td></tr>
            <tr>
              <td colSpan="3" className="border border-black p-1 align-top h-10 w-1/2 relative z-20">APELLIDOS Y NOMBRES:<br/><input type="text" name="apellidos_nombres" value={formIVSS.apellidos_nombres} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-black text-xs text-black" /></td>
              <td className="border border-black p-1 align-top w-[20%] relative z-20">CEDULA DE IDENTIDAD Nº:<br/><input type="text" name="cedula" value={formIVSS.cedula} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-black text-xs text-black" /></td>
              <td className="border border-black p-1 align-top leading-none text-[10px] relative z-20">
                SEXO:<br/>
                <div className="flex justify-between items-center mt-1 cursor-pointer w-full" onClick={() => toggleMarca('sexo_f')}>FEMENINO <CuadroCheck valor={marcas['sexo_f']} /></div>
                <div className="flex justify-between items-center mt-0.5 cursor-pointer w-full" onClick={() => toggleMarca('sexo_m')}>MASCULINO <CuadroCheck valor={marcas['sexo_m']} /></div>
              </td>
              <td className="border border-black p-0 align-top relative z-20">
                <table className="w-full h-full border-collapse bg-white"><tbody><tr>
                  <td className="border-r border-black p-1 align-top w-1/2 h-10">EDAD:<br/><input type="text" name="edad" value={formIVSS.edad} onChange={handleIVSSChange} className="w-full bg-transparent outline-none text-center font-black text-xs text-black" /></td>
                  <td className="p-1 align-top w-1/2">EDO. CIVIL:<br/><input type="text" name="edo_civil" value={formIVSS.edo_civil} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-[9px] text-black" /></td>
                </tr></tbody></table>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-1 align-top h-10 relative z-20">LUGAR DE NACIMIENTO:<br/><input type="text" name="lugar_nacimiento" value={formIVSS.lugar_nacimiento} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-black text-xs" /></td>
              <td className="border border-black p-1 align-top relative z-20">FECHA DE NACIMIENTO:<br/><input type="text" name="fecha_nacimiento" value={formIVSS.fecha_nacimiento} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-center text-black text-xs" /></td>
              <td className="border border-black p-1 align-top leading-none text-[10px] relative z-20">NACIONALIDAD:<br/>
                <div className="flex justify-between items-center mt-1 cursor-pointer w-full" onClick={() => toggleMarca('nac_v')}>VENEZOLANO <CuadroCheck valor={marcas['nac_v']} /></div>
                <div className="flex justify-between items-center mt-0.5 cursor-pointer w-full" onClick={() => toggleMarca('nac_e')}>EXTRANJERO <CuadroCheck valor={marcas['nac_e']} /></div>
              </td>
              <td colSpan="2" className="border border-black p-1 align-top relative z-20">OCUPACION:<br/><input type="text" name="ocupacion" value={formIVSS.ocupacion} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-black text-xs" /></td>
            </tr>
            <tr><td colSpan="6" className="border border-black p-1 align-top h-8 relative z-20">DIRECCION DE HABITACION:<br/><input type="text" name="direccion_habitacion" value={formIVSS.direccion_habitacion} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-black text-xs" /></td></tr>
            <tr><td colSpan="6" className="border border-black p-1 bg-gray-100/50">EN CASO DE EMERGENCIA AVISAR A:</td></tr>
            <tr>
              <td colSpan="3" className="border border-black p-1 align-top h-8 relative z-20">APELLIDO Y NOMBRE:<input type="text" name="emergencia_nombre" value={formIVSS.emergencia_nombre} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-black text-xs" /></td>
              <td className="border border-black p-1 align-top relative z-20">PARENTESCO:<input type="text" name="emergencia_parentesco" value={formIVSS.emergencia_parentesco} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-black text-xs" /></td>
              <td colSpan="2" className="border border-black p-1 align-top relative z-20">DIRECCION:<input type="text" name="emergencia_direccion" value={formIVSS.emergencia_direccion} onChange={handleIVSSChange} className="w-full bg-transparent outline-none uppercase font-bold text-black text-xs" /></td>
            </tr>
            <tr>
              <td colSpan="3" className="border-r border-black p-1"></td>
              <td className="border border-black p-1 align-top relative z-20">FECHA DE INGRESO:<br/><input type="date" name="fecha_ingreso" value={formIVSS.fecha_ingreso} onChange={handleIVSSChange} className="w-full bg-transparent outline-none font-bold text-black" /></td>
              <td className="border border-black p-1 align-top relative z-20">HORA:<br/><div className="flex"><input type="time" name="hora_ingreso" value={formIVSS.hora_ingreso} onChange={handleIVSSChange} className="w-full bg-transparent outline-none font-bold text-black" /></div></td>
              <td className="border border-black p-1 align-top relative z-20">FECHA ADMISION ANTERIOR:<br/><input type="date" name="fecha_admision_anterior" value={formIVSS.fecha_admision_anterior} onChange={handleIVSSChange} className="w-full bg-transparent outline-none font-bold text-black" /></td>
            </tr>
          </tbody>
        </table>

        <div className="w-full border-t-[3px] border-b-[2px] border-black text-center font-black text-[9px] py-0.5 mb-2 shrink-0">
          NOTA: AL SER ADMITIDO, EL PACIENTE DEBE FIRMAR LA AUTORIZACION QUE APARECE AL DORSO DE ESTA HOJA
        </div>

        <div className="w-full border-b-[2px] border-black pb-1 mb-2 h-[55px] shrink-0 relative">
          <span className="font-bold text-[10px] block mb-0.5">MOTIVO(S) DE INGRESO:</span>
          <LinedBlock name="motivo_ingreso" value={formIVSS.motivo_ingreso} onChange={handleIVSSChange} rows={2} />
        </div>

        {/* Cajas flexibles para que nada se salga del borde inferior */}
        <div className="w-full border-b-[2px] border-black pb-1 mb-1.5 flex-1 relative flex flex-col min-h-[90px]">
          <span className="font-bold text-[10px]">ENFERMEDAD ACTUAL: <span className="text-[8px] font-normal">(HACER RELATO CONCISO Y COMPLETO DE LAS DOLENCIAS, INDICANDO FECHA DE COMIENZO, DURACION Y TRATAMIENTO DE CADA UNA DE ELLAS):</span></span>
          <div className="flex-1 relative w-full mt-1">
            <LinedTextarea name="enfermedad_actual" value={formIVSS.enfermedad_actual} onChange={handleIVSSChange} />
          </div>
        </div>

        <div className="mt-1 shrink-0 bg-white relative z-20">
          <span className="font-bold text-[10px]">DIAGNOSTICO PROVISIONAL:</span>
          <div className="w-full border-b border-black h-5 relative z-20">
            <input type="text" name="diagnostico_provisional" value={formIVSS.diagnostico_provisional} onChange={handleIVSSChange} className="absolute bottom-0 w-full outline-none font-bold text-[11px] bg-transparent text-black" />
          </div>
          <div className="w-full border-b border-black h-4 mt-1"></div>
          
          <div className="flex justify-end mt-2 mb-1">
            <div className="w-[35%] text-center border-t border-black pt-1 text-[9px] font-bold">FIRMA DEL MEDICO</div>
          </div>

          <table className="w-full border-collapse border-[2px] border-black text-[9px] font-bold bg-white text-black relative z-20">
            <tbody>
              <tr>
                <td className="border border-black p-1 align-top w-1/4">EGRESO POR:</td>
                <td className="border border-black p-1 w-[20%]">
                  <div className="flex items-center gap-1 cursor-pointer w-full" onClick={() => toggleMarca('egreso_cur')}>CURACION <CuadroCheck valor={marcas['egreso_cur']} /></div>
                  <div className="flex items-center gap-1 mt-0.5 cursor-pointer w-full" onClick={() => toggleMarca('egreso_mej')}>MEJORIA <CuadroCheck valor={marcas['egreso_mej']} /></div>
                  <div className="flex items-center gap-1 mt-0.5 cursor-pointer w-full" onClick={() => toggleMarca('egreso_mue')}>MUERTE <CuadroCheck valor={marcas['egreso_mue']} /></div>
                  <div className="flex items-center gap-1 mt-0.5 cursor-pointer w-full" onClick={() => toggleMarca('egreso_aut')}><span className="font-normal">(AUTOPSIA PEDIDA)</span> <CuadroCheck valor={marcas['egreso_aut']} /></div>
                </td>
                <td className="border border-black p-1 align-top">
                  OTRAS CAUSAS:<br/><span className="text-[8px] font-normal">(SI ES CONTRA OPINION MEDICA, HACERLE FIRMAR EL DORSO)</span>
                  <div className="w-full border-b border-black mt-3"></div>
                </td>
              </tr>
              <tr><td colSpan="3" className="border border-black p-1 align-top h-8">DIAGNOSTICO CLINICO FINAL:<br/><input type="text" name="diagnostico_clinico_final" value={formIVSS.diagnostico_clinico_final} onChange={handleIVSSChange} className="w-full bg-transparent outline-none font-bold text-black" /></td></tr>
              <tr>
                <td colSpan="2" className="border border-black p-1">FECHA DE EGRESO: <input type="text" className="border-b border-black w-24 outline-none text-black"/> HORA: <input type="text" className="border-b border-black w-10 outline-none text-black"/> m.</td>
                <td className="border border-black p-1">FIRMA DEL (LA) JEFE(A) DE SERVICIO:</td>
              </tr>
              <tr><td colSpan="3" className="border border-black p-1 align-top h-8">DIAGNOSTICO ANATOMO - PATOLOGICO:<br/><input type="text" name="diagnostico_anatomo" value={formIVSS.diagnostico_anatomo} onChange={handleIVSSChange} className="w-full bg-transparent outline-none font-bold text-black" /></td></tr>
            </tbody>
          </table>
          <div className="flex justify-between text-[9px] font-bold mt-1"><span>DDI/01.09</span><span>HISTORIA I</span></div>
        </div>
      </div>

      {/* PÁGINA 2: DORSO PARTE I */}
      <div className="bg-white text-black border border-gray-400 shadow-2xl w-[210mm] h-[297mm] p-16 font-sans box-border relative flex flex-col justify-center overflow-hidden">
        <div className="text-center font-bold text-xl tracking-widest mb-6 underline">AUTORIZACION</div>
        <p className="text-justify text-sm leading-relaxed mb-12">El suscrito autoriza al (la) médico o a los (las) médicos encargados(as) del cuidado del paciente cuyo nombre aparece en el anverso de esta hoja, a efectuar todo examen terapéutico, anestesia, intervención quirúrgica, etc., que se consideren necesarios o aconsejables para el diagnóstico y tratamiento del caso.</p>
        
        <div className="flex justify-between items-end mb-8 mt-12 text-sm font-bold relative z-20">
          <div className="flex items-end">FECHA: <input type="text" name="fecha_autorizacion1" value={formIVSS.fecha_autorizacion1} onChange={handleIVSSChange} className="border-b border-black ml-2 w-48 outline-none text-center text-black" /></div>
          <div className="text-center w-[40%]"><input type="text" name="firma_autorizacion1" value={formIVSS.firma_autorizacion1} onChange={handleIVSSChange} className="border-b border-black w-full outline-none text-center text-black" /><br/>(Paciente)</div>
        </div>
        <div className="flex justify-between items-end text-sm font-bold relative z-20">
          <div className="flex items-end">TESTIGO: <input type="text" name="testigo_autorizacion1" value={formIVSS.testigo_autorizacion1} onChange={handleIVSSChange} className="border-b border-black ml-2 w-48 outline-none text-center text-black" /></div>
          <div className="text-center w-[40%] border-t border-black pt-1">(Firma) (Familiar)</div>
        </div>
        <div className="text-left text-sm mt-4 font-bold flex items-end relative z-20">PARENTESCO: <input type="text" name="parentesco_autorizacion1" value={formIVSS.parentesco_autorizacion1} onChange={handleIVSSChange} className="border-b border-black ml-2 w-48 outline-none text-center text-black" /></div>

        <div className="w-full border-b-2 border-black my-16"></div>

        <div className="font-bold text-xl mb-6 text-center underline">Exoneración de Responsabilidad por Egreso</div>
        <p className="text-justify text-sm leading-relaxed mb-12">El suscrito certifica que la persona cuyo nombre aparece en el anverso de esta hoja, paciente del Hospital sale del mismo contra la opinión de los (las) médicos. Hago constar que habiendo sido advertido de los riesgos que esto implica, descargo de toda responsabilidad a los (las) médicos tratantes y al Hospital por las consecuencias que de ello puedan resultar.</p>

        <div className="flex justify-between items-end mb-8 mt-12 text-sm font-bold relative z-20">
          <div className="flex items-end">FECHA: <input type="text" name="fecha_autorizacion2" value={formIVSS.fecha_autorizacion2} onChange={handleIVSSChange} className="border-b border-black ml-2 w-48 outline-none text-center text-black" /></div>
          <div className="text-center w-[40%]"><input type="text" name="firma_autorizacion2" value={formIVSS.firma_autorizacion2} onChange={handleIVSSChange} className="border-b border-black w-full outline-none text-center text-black" /><br/>(Paciente)</div>
        </div>
        <div className="flex justify-between items-end text-sm font-bold relative z-20">
          <div className="flex items-end">TESTIGO: <input type="text" name="testigo_autorizacion2" value={formIVSS.testigo_autorizacion2} onChange={handleIVSSChange} className="border-b border-black ml-2 w-48 outline-none text-center text-black" /></div>
          <div className="text-center w-[40%] border-t border-black pt-1">(Firma) (Familiar)</div>
        </div>
        <div className="text-left text-sm mt-4 font-bold flex items-end mb-10 relative z-20">PARENTESCO: <input type="text" name="parentesco_autorizacion2" value={formIVSS.parentesco_autorizacion2} onChange={handleIVSSChange} className="border-b border-black ml-2 w-48 outline-none text-center text-black" /></div>
        <div className="text-right text-[11px] font-bold absolute bottom-8 right-16">Forma: 15-108-A</div>
      </div>
    </>
  );
}