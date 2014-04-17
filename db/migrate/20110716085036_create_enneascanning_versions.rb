class CreateEnneascanningVersions < ActiveRecord::Migration
  def self.up
    create_table :enneascanning_versions do |t|
      t.string :version
      t.string :app_name
      t.datetime :build
     
      t.timestamps
    end
  end

  def self.down
    drop_table :enneascanning_versions
  end
end