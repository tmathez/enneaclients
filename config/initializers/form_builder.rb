class ActionView::Helpers::FormBuilder
  alias :base_text_field :text_field
	
  def text_field(method, options={})
  	if !@object.nil?
	    column_type = @object.class.columns.select{|c| c.name == method.to_s }[0].type
	    
	    #En fonction du type de champ on ajoute la class appropriée
	    case column_type
	      when :float
	        options.merge!(:class => "#{options[:class].to_s} numeric_field")
	        options.merge!(:value => format_number(@object[method],"",2)) unless @object[method].nil? or !options[:value].nil?
	      when :date
	        options.merge!(:class => "#{options[:class].to_s} date_field")
	        options.merge!(:value => @object[method].strftime("%d.%m.%Y")) unless @object[method].nil? or !options[:value].nil?
	      when :time
	      	options.merge!(:class => "#{options[:class].to_s} time_field")
	        options.merge!(:value => @object[method].strftime("%H:%M")) unless @object[method].nil? or !options[:value].nil?
	    end
    end
    
    self.base_text_field(method, options)
  end
  
  private
  	
  def format_number(value,separator,decimals)
  	value = value.nil? ? 0 : value
    value = decimals ? '%.2f' % value : '%.0f' % value
    value.to_s.gsub(/(\d)(?=(\d\d\d)+(?!\d))/, "\\1"+separator)
  end
end