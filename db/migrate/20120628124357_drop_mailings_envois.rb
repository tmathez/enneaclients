class DropMailingsEnvois < ActiveRecord::Migration
  def self.up
  	drop_table :mailings_envois
  end

  def self.down
    create_table :mailings_envois do |t|
      t.integer :mailing_id
      t.integer :envoi_id
      
      t.timestamps
    end
  end
end
