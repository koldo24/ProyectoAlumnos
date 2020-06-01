package com.ipartek.formacion.model.dao;

import java.sql.SQLException;
import java.util.List;


public interface IDAO<P> {
	
	List<P> getAll();
	
	//buscar por id

	P getById(int id) throws Exception;
	
	//Buscar una persona por el nombre

	P getByNombre(String nombre) throws Exception;
	
	//Eliminar por id
	
	P delete(int id) throws Exception, SQLException;
	
	// Crea un nuevo objeto

	P insert(P pojo) throws Exception, SQLException;
	
	//Modificar 

	P update(P pojo)throws Exception, SQLException;
	
	

}
