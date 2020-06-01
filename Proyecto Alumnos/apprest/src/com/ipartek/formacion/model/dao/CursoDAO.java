package com.ipartek.formacion.model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Logger;

import com.ipartek.formacion.model.Curso;
import com.ipartek.formacion.model.Persona;

public class CursoDAO implements IDAO<Curso> {
	
	private static final Logger LOGGER = Logger.getLogger(CursoDAO.class.getCanonicalName());
	
	private static CursoDAO INSTANCE = null;
	
	private static String SQL_SELECIONARTODOS   = "SELECT id, nombre, precio, imagen FROM curso ORDER BY id DESC LIMIT 100; ";
	private static String SQL_SELECIONARPORID   = "SELECT id, nombre, precio, imagen FROM curso WHERE id = ?; ";
	private static String SQL_BUSCAR_NOMBRE   = "SELECT id, nombre, precio, imagen FROM curso WHERE nombre LIKE ? ORDER BY id DESC LIMIT 100; ";
	
	private CursoDAO() {
		super();
	}
	
	public synchronized static CursoDAO getInstance() {
        if (INSTANCE == null) {
        	INSTANCE = new CursoDAO();
        }
        return INSTANCE;
    }
	

	@Override
	public List<Curso> getAll() {		
		ArrayList<Curso> registros = new ArrayList<Curso>();
		try (Connection con = ConnectionManager.getConnection();
				PreparedStatement pst = con.prepareStatement(SQL_SELECIONARTODOS);
				ResultSet rs = pst.executeQuery();) {

			LOGGER.info(pst.toString());			
			while( rs.next() ) {				
				registros.add( mapper(rs) );				
			}		
			
		} catch (SQLException e) {
			e.printStackTrace();		
		}
		return registros;
	}
	


	public List<Curso> getAllLikeNombre( String busqueda ) {
		LOGGER.info("getAll");		
		ArrayList<Curso> registros = new ArrayList<Curso>();
		try (Connection con = ConnectionManager.getConnection();
				PreparedStatement pst = con.prepareStatement(SQL_BUSCAR_NOMBRE);
				) {

			//los simobolos % % no se pueden poner en la SQL, siempre en el PST
			pst.setString(1, "%" + busqueda + "%");
			
			try( ResultSet rs = pst.executeQuery() ){
				
				LOGGER.info(pst.toString());			
				while( rs.next() ) {				
					registros.add( mapper(rs) );				
				}	
			}	
			
		} catch (SQLException e) {
			e.printStackTrace();		
		}
		return registros;
	}
	
	private Curso mapper( ResultSet rs ) throws SQLException {
		Curso c = new Curso();
		c.setId( rs.getInt("id") );
		c.setNombre( rs.getString("nombre"));
		c.setPrecio( rs.getFloat("precio"));
		c.setImagen( rs.getString("imagen"));
		return c;
	}


	@Override
	public Curso getById(int id) throws Exception {
		Curso registro = null;
		try (Connection con = ConnectionManager.getConnection();
				PreparedStatement pst = con.prepareStatement(SQL_SELECIONARPORID);
		) {

			pst.setInt(1, id);
			LOGGER.info(pst.toString());
			
			try( ResultSet rs = pst.executeQuery() ){			
				
				if( rs.next() ) {					
					registro = mapper(rs);
				}else {
					throw new Exception("ID NO ENCONTRADO = " + id);
				}
			}
			
			
		} catch (SQLException e) {

			e.printStackTrace();
		}

		return registro;
	}


	@Override
	public Curso delete(int id) throws Exception, SQLException {
		//TODO no implementar
		return null;
	}


	@Override
	public Curso insert(Curso pojo) throws Exception, SQLException {
		//TODO no implementar
		return null;
	}


	@Override
	public Curso update(Curso pojo) throws Exception, SQLException {
		//TODO no implementar
		return null;
	}

	@Override
	public Curso getByNombre(String nombre) throws Exception {
		//TODO no implementar
		return null;
	}
	

}
