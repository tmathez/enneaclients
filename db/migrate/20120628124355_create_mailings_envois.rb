class CreateMailingsEnvois < ActiveRecord::Migration
  def self.up
    create_table :mailings_envois do |t|
      t.integer :mailing_id
      t.integer :envoi_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :mailings_envois
  end
end
