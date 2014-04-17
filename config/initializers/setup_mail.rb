#ActionMailer::Base.delivery_method = :smtp

ActionMailer::Base.smtp_settings = {
  :address              => "smtp.gmail.com",
  :port                 => 587,
  :domain               => "enneasoft.ch",
  :user_name            => "enneasoft",
  :password             => "Ennea-08",
  :authentication       => "plain",
  :enable_starttls_auto => true
}