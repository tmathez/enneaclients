class CreateLicencesLogs < ActiveRecord::Migration
  def self.up
    create_table :licences_logs do |t|
      t.integer :client_id
      t.string :poste_id
      t.boolean :granted
      t.datetime :date_licence
      t.string :message

      t.timestamps
    end
  end

  def self.down
    drop_table :licences_logs
  end
end
