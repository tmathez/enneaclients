class ResponsableMailer < ActionMailer::Base
  def resume(responsable_id,sujet,content)
  	@responsable = Responsable.find(responsable_id)
  	@content = content
  	@sujet = sujet
  	to = []
  	for responsable in Responsable.where("id <> ? AND email IS NOT NULL", responsable_id)
  		to << "#{responsable.prenom} <#{responsable.email}>"
  	end
  	mail(:to => to, :subject => @sujet + " - " + @responsable.prenom, :from => @responsable.email)
  end
end
