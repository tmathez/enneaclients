class SolutionValidator < ActiveModel::EachValidator
  def validate_each(object, attribute, value)
  	if object.resolu
  	  if value.nil? 
  		record.errors[attribute] << "doit &ecirc;tre remplie si une solution a &eacute;t&eacute; trouv&eacute;e!"
  	  end
  	end
  end
end