class CreateMailings < ActiveRecord::Migration
  def self.up
    create_table :mailings do |t|
      t.integer :concerne_id
      t.integer :type_mailing_id
      t.date :date_mailing
      t.string :nom
      t.string :filtre
      t.boolean :termine
      
      t.timestamps
    end
  end

  def self.down
    drop_table :mailings
  end
end