class CreateLicences < ActiveRecord::Migration
  def self.up
    create_table :licences do |t|
      t.integer :client_id
      t.string :poste_id

      t.timestamps
    end
  end

  def self.down
    drop_table :licences
  end
end
