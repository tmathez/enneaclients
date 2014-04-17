class AddMailingIdToEnvois < ActiveRecord::Migration
  def change
    add_column :envois, :mailing_id, :integer
  end
end
