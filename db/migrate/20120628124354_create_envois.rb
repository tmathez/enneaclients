class CreateEnvois < ActiveRecord::Migration
  def self.up
    create_table :envois do |t|
      t.date :date_envoi
      t.string :nom
      t.text :filtre
      t.boolean :termine
      
      t.timestamps
    end
  end

  def self.down
    drop_table :envois
  end
end