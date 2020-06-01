package com.ipartek.formacion.api.controller;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Set;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.ipartek.formacion.model.Curso;
import com.ipartek.formacion.model.Persona;
import com.ipartek.formacion.model.dao.CursoDAO;
import com.ipartek.formacion.model.dao.PersonaDAO;

@Path("/personas")
@Produces("application/json")
@Consumes("application/json")
public class PersonaController {
	
	@Context
	private ServletContext context;

	private static final Logger LOGGER = Logger.getLogger(PersonaController.class.getCanonicalName());
	private static PersonaDAO personaDAO = PersonaDAO.getInstance();
	private static CursoDAO cursoDAO = CursoDAO.getInstance();

	private ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	private Validator validator = factory.getValidator();
	

	@GET
	public Response getAll( @QueryParam("filtro") String filtro  ) {
		
		Response response = Response.status(Status.INTERNAL_SERVER_ERROR).entity(null).build();
		 // buscar atraves del filtro
		
		if ( filtro != null && !filtro.trim().isEmpty() ) {                      
			
			
			try {
				Persona registro = personaDAO.getByNombre(filtro);
				response = Response.status(Status.OK).entity(registro).build();
			}catch (Exception e) {
				ResponseBody rb = new ResponseBody();
				rb.setInformacion("No se ha encontrado el nombre " + filtro);
				rb.getHypermedias().add(new Hipermedia("buscar por id", "GET", "personas/{id}") );
				rb.getHypermedias().add(new Hipermedia("listado de personas", "GET", "personas") );
				response = Response.status(Status.NOT_FOUND).entity(rb).build();
			}	
				
		}else {																	  
			
			LOGGER.info("listado completo de personas");
			ArrayList<Persona> registros = (ArrayList<Persona>) personaDAO.getAll();
			response = Response.status(Status.OK).entity(registros).build();
			
			
		}	
		return response;
	}
	
	

	@POST
	public Response insert(Persona persona) {
		LOGGER.info("insert(" + persona + ")");
		Response response = Response.status(Status.INTERNAL_SERVER_ERROR).entity(null).build();

		// validar el objeto
		Set<ConstraintViolation<Persona>> violations = validator.validate(persona);
		if (violations.isEmpty()) {

			try {
				personaDAO.insert(persona);
				response = Response.status(Status.CREATED).entity(persona).build();

			} catch (Exception e) {

				ResponseBody responseBody = new ResponseBody();
				responseBody.setInformacion("este nombre esta repetido o no ha sido capaz de añadirlo correctamente");
				response = Response.status(Status.CONFLICT).entity(responseBody).build();
			}

		} else {
			ArrayList<String> errores = new ArrayList<String>();
			for (ConstraintViolation<Persona> violation : violations) {
				errores.add(violation.getPropertyPath() + ": " + violation.getMessage());
			}

			response = Response.status(Status.BAD_REQUEST).entity(errores).build();
		}

		return response;

	}

	@PUT
	@Path("/{id: \\d+}")
	public Response update(@PathParam("id") int id, Persona persona) {
		LOGGER.info("update(" + id + ", " + persona + ")");
		Response response = Response.status(Status.NOT_FOUND).entity(persona).build();

		Set<ConstraintViolation<Persona>> violations = validator.validate(persona);
		if (!violations.isEmpty()) {
			ArrayList<String> errores = new ArrayList<String>();
			for (ConstraintViolation<Persona> violation : violations) {
				errores.add(violation.getPropertyPath() + ": " + violation.getMessage());
			}
			response = Response.status(Status.BAD_REQUEST).entity(errores).build();

		} else {

			try {
				personaDAO.update(persona);
				response = Response.status(Status.OK).entity(persona).build();

			} catch (Exception e) {

				ResponseBody responseBody = new ResponseBody();
				responseBody.setInformacion("nombre repe");
				response = Response.status(Status.CONFLICT).entity(responseBody).build();
			}

		}

		return response;
	}

	@DELETE
	@Path("/{id: \\d+}")
	public Response eliminar(@PathParam("id") int id) {
		LOGGER.info("eliminar(" + id + ")");

		Response response = Response.status(Status.INTERNAL_SERVER_ERROR).entity(null).build();
		ResponseBody responseBody = new ResponseBody();
		Persona persona = null;

		try {
			persona = personaDAO.delete(id);			
			responseBody.setData(persona);
			responseBody.setInformacion("persona eliminada");
			//envio hipermedia no me ha quedado muy claro
			responseBody.getHypermedias()
					.add(new Hipermedia("listado personas", "GET", "http://localhost:8080/apprest/api/personas/"));
			responseBody.getHypermedias()
					.add(new Hipermedia("detalle personas", "GET", "http://localhost:8080/apprest/api/personas/{id}"));

			response = Response.status(Status.OK).entity(responseBody).build();

		} catch (SQLException e) {
			responseBody.setInformacion("No se puede elminar, cursos activos");
			response = Response.status(Status.CONFLICT).entity(responseBody).build();

		} catch (Exception e) {
			responseBody.setInformacion("persona no encontrada");
			response = Response.status(Status.NOT_FOUND).entity(responseBody).build();
		}
		return response;
	}
	
	
	@POST
	@Path("/{idPersona}/curso/{idCurso}")
	public Response asignarCurso(@PathParam("idPersona") int idPersona, @PathParam("idCurso") int idCurso) {
		
		Response response = Response.status(Status.INTERNAL_SERVER_ERROR).entity(null).build();
		ResponseBody responseBody = new ResponseBody();

		try {		
			personaDAO.asignarCurso(idPersona, idCurso);
			Curso c = cursoDAO.getById(idCurso);
			
			responseBody.setInformacion("el curso se asignado correctamente");
			responseBody.setData(c);
			response = Response.status(Status.CREATED).entity(responseBody).build();
			
		} catch (Exception e) {			
				responseBody.setInformacion(e.getMessage());
				response = Response.status(Status.NOT_FOUND).entity(responseBody).build();
		}

		return response;

	}
	
	
	@DELETE
	@Path("/{idPersona}/curso/{idCurso}")
	public Response eliminarCurso(@PathParam("idPersona") int idPersona, @PathParam("idCurso") int idCurso) {
		
		Response response = Response.status(Status.INTERNAL_SERVER_ERROR).entity(null).build();
		ResponseBody responseBody = new ResponseBody();

		try {		
			personaDAO.eliminarCurso(idPersona, idCurso);
			Persona p = personaDAO.getById(idPersona);
			
			responseBody.setInformacion("Curso eliminado");
			responseBody.setData(p);
			response = Response.status(Status.OK).entity(responseBody).build();
			
		} catch (Exception e) {			
				responseBody.setInformacion(e.getMessage());
				response = Response.status(Status.NOT_FOUND).entity(responseBody).build();
		}

		return response;

	}
	

}
